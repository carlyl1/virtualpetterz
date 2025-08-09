const { test, expect } = require('@playwright/test')

test.describe('VirtualPetterz App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('should load the main page', async ({ page }) => {
    // Check if the main title is visible
    await expect(page.locator('h1')).toContainText('VirtualPetterz')
    
    // Check if the pet world canvas is present (use first canvas for consistency)
    await expect(page.locator('canvas').first()).toBeVisible()
    
    // Take a screenshot
    await page.screenshot({ path: 'tests/screenshots/homepage.png' })
  })

  test('should have working navigation', async ({ page }) => {
    // Wait for the side dock to be visible
    await expect(page.locator('.side-dock')).toBeVisible()
    
    // Check if navigation buttons are present (using first occurrence to avoid duplicates)
    await expect(page.getByText('Feed').first()).toBeVisible()
    await expect(page.getByText('Play').first()).toBeVisible()
    await expect(page.getByText('Group Adventure')).toBeVisible()
    await expect(page.getByText('Pet Garden')).toBeVisible()
    
    // Take screenshot of sidebar
    await page.screenshot({ path: 'tests/screenshots/sidebar.png' })
  })

  test('should show pet in world', async ({ page }) => {
    // Wait for pet world to load
    await page.waitForTimeout(2000)
    
    // The pet should be rendered on the canvas
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()
    
    // Take screenshot to verify pet is visible
    await page.screenshot({ path: 'tests/screenshots/pet-world.png' })
  })

  test('should navigate to Group Adventure', async ({ page }) => {
    // Click Group Adventure button
    await page.getByText('Group Adventure').click()
    
    // Should navigate to group adventure page
    await expect(page.getByText('Join or Create Adventure Room')).toBeVisible()
    await expect(page.getByText('Create New Room')).toBeVisible()
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/group-adventure.png' })
  })

  test('should navigate to Pet Garden', async ({ page }) => {
    // Click Pet Garden button
    await page.getByText('Pet Garden').click()
    
    // Wait for navigation
    await page.waitForTimeout(1000)
    
    // Should show garden content or back button
    await expect(page.getByText('Back Home')).toBeVisible()
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/pet-garden.png' })
  })

  test('should have working chat system', async ({ page }) => {
    // Find chat input
    const chatInput = page.locator('input[placeholder*="Talk to your pet"]')
    await expect(chatInput).toBeVisible()
    
    // Type a message
    await chatInput.fill('Hello pet!')
    
    // Press enter or click send
    await page.keyboard.press('Enter')
    
    // Wait for response
    await page.waitForTimeout(2000)
    
    // Check if message appears in chat
    await expect(page.locator('.messages')).toContainText('Hello pet!')
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/chat.png' })
  })

  test('should show pet stats', async ({ page }) => {
    // Check if pet stats are visible
    await expect(page.getByText('Hunger:')).toBeVisible()
    await expect(page.getByText('Happiness:')).toBeVisible()
    
    // Check if feed/play buttons work
    const feedButton = page.getByText('Feed').first()
    await expect(feedButton).toBeVisible()
    
    const playButton = page.getByText('Play').first()  
    await expect(playButton).toBeVisible()
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/pet-stats.png' })
  })

  test('should create group adventure room', async ({ page }) => {
    // Navigate to group adventure
    await page.getByText('Group Adventure').click()
    
    // Create new room
    await page.getByText('Create New Room').click()
    
    // Wait for room creation
    await page.waitForTimeout(2000)
    
    // Should show room ID
    await expect(page.getByText(/Room: ROOM-/)).toBeVisible()
    await expect(page.getByText('Start Adventure')).toBeVisible()
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/group-room.png' })
  })

  test('should handle P2P battle navigation', async ({ page }) => {
    // Navigate to battle (use first Battle button to avoid duplicates)
    await page.getByText('Battle').first().click()
    
    // Should show battle options
    await expect(page.getByText('Battle Arena')).toBeVisible()
    await expect(page.getByText('P2P Battle')).toBeVisible()
    await expect(page.getByText('Classic Battle')).toBeVisible()
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/battle-menu.png' })
  })

  test('should show responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })
    await page.reload()
    
    // Check if content is still visible (use first canvas to avoid duplicates)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('canvas').first()).toBeVisible()
    
    // Take mobile screenshot
    await page.screenshot({ path: 'tests/screenshots/mobile-view.png' })
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    
    await page.screenshot({ path: 'tests/screenshots/tablet-view.png' })
  })
})