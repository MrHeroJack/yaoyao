import { test, expect } from '@playwright/test'

test('管理员登录并看到上传入口', async ({ page }) => {
  await page.goto('/')
  await page.getByText('管理员 = 登录').click()
  await page.getByPlaceholder('请输入密码').fill('yaoyao2024')
  await page.getByText('确认').click()
  await expect(page.getByText('管理员模式已激活')).toBeVisible()
  await expect(page.getByText('添加新事件')).toBeVisible()
})

