import { test, expect } from '@playwright/test'

test('管理员登录并看到上传入口', async ({ page }) => {
  await page.route('**/api/admin/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ authenticated: false }),
    })
  })
  await page.route('**/api/admin/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, expiresIn: 1800 }),
      headers: {
        'set-cookie': 'yaoyao_admin_session=test; Path=/; HttpOnly; SameSite=Lax; Max-Age=1800',
      },
    })
  })

  await page.goto('/')
  await page.getByTestId('admin-auth-toggle').click()
  await page.getByLabel('管理员密码').fill('test-password')
  await page.getByText('确认').click()
  await expect(page.getByText('记录新的美好时刻')).toBeVisible()
})
