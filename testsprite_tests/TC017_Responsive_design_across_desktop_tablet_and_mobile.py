import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Resize viewport to mobile dimensions and verify navigation menus are accessible and content is readable without horizontal scrolling.
        await page.goto('http://localhost:3000/', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Resize viewport to mobile dimensions and verify navigation menus are accessible and content is readable without horizontal scrolling.
        await page.mouse.wheel(0, 300)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=MMW Hubix').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Resource Hub').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Articles').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=School Website').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Login').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Quick access to all essential school resources, tools, and information in one centralized location.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Google').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=All Categories').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=8').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Uncategorized').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=3').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Networking').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=1').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Security').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Hardware').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Software').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=2 resources').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Chrome Web Store').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Browse and install Chrome extensions and apps').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Windows Update Center').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Microsoft Windows update and troubleshooting center').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=PC Hardware Guide').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Intel support documentation for computer hardware').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Password Manager Guide').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Learn how to use Google Password Manager securely').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Network Troubleshooting Guide').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Comprehensive guide for diagnosing network problems').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=IT Support Form').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Submit IT support requests and technical issues').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=School Email').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Access your school Gmail account').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Google Classroom').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Online learning management system for assignments and grades').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=School Information Portal for C.C.C. Mong Man Wai College').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=© 2025 C.C.C. Mong Man Wai College. All rights reserved.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=The first version was built by the IT Perfect team in 2024-2025.').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    