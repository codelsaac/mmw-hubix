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
        # -> Check if resources are available in any category to click on distinct resources.
        frame = context.pages[-1]
        # Click 'All Categories' to load all resources and check availability.
        elem = frame.locator('xpath=html/body/div[2]/main/div/div/main/div/section/div[2]/div[2]/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on Login button to proceed to admin login for analytics dashboard access.
        frame = context.pages[-1]
        # Click Login button to access login page for admin authentication.
        elem = frame.locator('xpath=html/body/div[2]/header/div/nav/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input admin username and password, then click Login button.
        frame = context.pages[-1]
        # Input admin username
        elem = frame.locator('xpath=html/body/div[4]/div[2]/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin')
        

        frame = context.pages[-1]
        # Input admin password
        elem = frame.locator('xpath=html/body/div[4]/div[2]/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin123')
        

        frame = context.pages[-1]
        # Click Login button to authenticate as admin
        elem = frame.locator('xpath=html/body/div[4]/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on Admin Panel link to access analytics dashboard for resource usage verification.
        frame = context.pages[-1]
        # Click Admin Panel link to access analytics dashboard
        elem = frame.locator('xpath=html/body/div[2]/header/div/div/nav/div[5]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=MMW Hubix').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Resource Hub').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Activity News').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Admin Panel').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Admin Dashboard').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Manage all aspects of the MMW Hubix portal').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Resource Links').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=No links configured').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Categories').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=No categories configured').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Announcements').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=No announcements').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Articles').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=No articles published').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Team Members').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Active IT Prefects').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Demo accounts active').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Training Resources').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=No resources uploaded').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=School Information Portal for C.C.C. Mong Man Wai College').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=School Website').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=© 2025 C.C.C. Mong Man Wai College. All rights reserved.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Built with by the IT Perfect Team').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    