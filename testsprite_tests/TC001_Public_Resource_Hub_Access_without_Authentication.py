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
        # -> Perform a search and apply category filters using dynamic filters.
        frame = context.pages[-1]
        # Input search term 'student' in the search resources input box
        elem = frame.locator('xpath=html/body/div[2]/main/div/div/main/div/section/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('student')
        

        frame = context.pages[-1]
        # Click on 'Student Life' category filter button
        elem = frame.locator('xpath=html/body/div[2]/main/div/div/main/div/section/div[2]/div[2]/div/div/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Clear search input and category filters to check if resources appear without filters.
        frame = context.pages[-1]
        # Clear the search input to reset filters
        elem = frame.locator('xpath=html/body/div[2]/main/div/div/main/div/section/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('')
        

        frame = context.pages[-1]
        # Click 'All Categories' to clear category filters
        elem = frame.locator('xpath=html/body/div[2]/main/div/div/main/div/section/div[2]/div[2]/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Resource Hub').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Quick access to all essential school resources, tools, and information in one centralized location.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Academics').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Student Life').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Resources').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Technology').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Library').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Campus Services').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Health & Wellness').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Career Services').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Financial Aid').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Housing').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Transportation').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Events & Activities').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Clubs & Organizations').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Research').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=International Students').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Alumni').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Emergency Services').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=No resources available.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Stay updated with the latest events and activities from school clubs').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=No active activity news at the moment.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=School Information Portal for C.C.C. Mong Man Wai College').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Main Navigation').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Resource Hub').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Access learning resources and materials').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Activity News').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Latest school news and updates').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Internal Dashboard').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Staff and student portal').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Quick Links').first).to_be_visible(timeout=30000)
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
    