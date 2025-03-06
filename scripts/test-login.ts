import { chromium, Page } from 'playwright'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import puppeteer, { ConsoleMessage, HTTPRequest, HTTPResponse, Page as PuppeteerPage } from 'puppeteer'
import { writeFileSync } from 'fs'

interface TestResult {
  success: boolean
  errorMessage?: string
}

const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001
const BASE_URL = `http://localhost:${PORT}`

async function checkAndFixDatabase() {
  console.log('檢查資料庫中的測試用戶...')
  
  try {
    // 檢查測試用戶是否存在
    const user = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })

    if (!user) {
      console.log('找不到測試用戶,正在創建...')
      const hashedPassword = await hash('admin123', 10)
      await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: hashedPassword,
          name: 'Admin',
          role: 'admin',
          status: 'active'
        }
      })
      console.log('測試用戶創建成功')
    } else if (user.status !== 'active') {
      console.log('測試用戶狀態不正確,正在修正...')
      await prisma.user.update({
        where: { email: 'admin@example.com' },
        data: { status: 'active' }
      })
      console.log('測試用戶狀態已修正')
    }
  } catch (error) {
    console.error('檢查/修復資料庫時發生錯誤:', error)
  }
}

async function checkAndFixNextAuth() {
  console.log('檢查 NextAuth 配置...')
  // 這裡可以添加檢查 NextAuth 配置的邏輯
}

async function testLogin(): Promise<TestResult> {
  console.log('\n開始執行登入頁面測試...')
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 720 }
  })

  try {
    const page = await browser.newPage()
    
    // 監聽所有網絡請求
    page.on('request', (request: HTTPRequest) => {
      console.log('發送請求:', request.url())
    })
    
    page.on('response', async (response: HTTPResponse) => {
      console.log('收到響應:', response.url(), response.status())
      if (!response.ok()) {
        const text = await response.text().catch(() => 'Unable to get response text')
        console.log('響應內容:', text)
      }
    })

    // 監聽控制台日誌
    page.on('console', (msg: ConsoleMessage) => {
      console.log('瀏覽器控制台:', msg.text())
    })

    // 監聽錯誤
    page.on('pageerror', (err) => {
      console.log('頁面錯誤:', err.toString())
    })

    console.log('正在訪問登入頁面...')
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: 'networkidle0',
      timeout: 60000 // 增加到60秒
    })
    console.log('頁面加載完成')

    console.log('等待表單元素...')
    await page.waitForSelector('form', { timeout: 60000 }) // 增加到60秒
    console.log('表單元素已找到')

    console.log('填寫表單...')
    await page.type('#email', 'admin@example.com', { delay: 100 })
    await page.type('#password', 'admin123', { delay: 100 })
    console.log('已填寫登入表單')

    console.log('準備點擊登入按鈕...')
    const submitButton = await page.$('button[type="submit"]')
    if (!submitButton) {
      throw new Error('找不到提交按鈕')
    }

    // 截圖記錄點擊前的狀態
    await page.screenshot({ path: 'login-before-click.png' })
    console.log('已保存點擊前的截圖')

    console.log('點擊登入按鈕...')
    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle0',
        timeout: 60000 // 增加到60秒
      }).catch(e => {
        console.log('導航超時或失敗:', e.toString())
        return null
      }),
      submitButton.click()
    ])

    console.log('已點擊登入按鈕並等待導航完成')

    // 檢查當前URL
    const currentUrl = page.url()
    console.log('當前頁面URL:', currentUrl)

    // 截圖記錄最終狀態
    await page.screenshot({ path: 'login-after-redirect.png' })
    console.log('已保存最終狀態的截圖')

    // 保存頁面內容以便調試
    const content = await page.content()
    writeFileSync('page-content.html', content)
    console.log('已保存頁面內容到 page-content.html')

    if (currentUrl === BASE_URL + '/') {
      console.log('登入成功！已跳轉到首頁')
      return { success: true }
    } else {
      const errorElement = await page.$('.MuiAlert-root')
      const errorMessage = errorElement ? 
        await errorElement.evaluate(el => el.textContent || '未知錯誤') : 
        '未跳轉到首頁'
      console.error('登入失敗:', errorMessage)
      return { success: false, errorMessage }
    }
  } catch (error) {
    console.error('測試過程中發生錯誤:', error)
    return { 
      success: false, 
      errorMessage: error instanceof Error ? error.message : '未知錯誤' 
    }
  } finally {
    await browser.close()
  }
}

async function runTests() {
  console.log('\n開始執行測試...')
  
  // 先檢查並修復資料庫
  await checkAndFixDatabase()
  
  // 檢查 NextAuth 配置
  await checkAndFixNextAuth()
  
  // 執行登入測試
  const result = await testLogin()
  
  if (!result.success) {
    console.log('測試失敗！')
    if (result.errorMessage) {
      console.log('錯誤:', result.errorMessage)
    }
    process.exit(1)
  } else {
    console.log('測試成功！')
    process.exit(0)
  }
}

// 執行測試
runTests().catch(console.error) 