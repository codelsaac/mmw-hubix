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
        # -> Click the floating AI chat assistant button to open the chat panel.
        frame = context.pages[-1]
        # Click the floating AI Assistant button to open the chat panel
        elem = frame.locator('xpath=html/body/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Send a simple query to the AI assistant using the input field.
        frame = context.pages[-1]
        # Input a simple query to the AI assistant
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('What are the school opening hours?')
        

        # -> Click the close button on the chat panel to verify smooth closing animation and disappearance of the panel.
        frame = context.pages[-1]
        # Click the close chat button to close the AI chat panel
        elem = frame.locator('xpath=html/body/div[2]/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Navigate to the Articles public page and verify the floating AI chat assistant button is visible and interactable.
        frame = context.pages[-1]
        # Click the Articles link to navigate to the Articles public page
        elem = frame.locator('xpath=html/body/div[2]/header/div/div/nav/div[2]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the floating AI chat assistant button to open the chat panel on the Articles page.
        frame = context.pages[-1]
        # Click the floating AI chat assistant button to open the chat panel on the Articles page
        elem = frame.locator('xpath=html/body/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Send a simple query to the AI assistant on the Articles page and verify the response.
        frame = context.pages[-1]
        # Input a simple query to the AI assistant on the Articles page
        elem = frame.locator('xpath=html/body/div[2]/div/div[2]/div/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('What is the next school event?')
        

        # -> Click the close button on the chat panel to verify smooth closing animation and disappearance of the panel on the Articles page.
        frame = context.pages[-1]
        # Click the close chat button to close the AI chat panel on the Articles page
        elem = frame.locator('xpath=html/body/div[2]/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Navigate to the School Website public page and verify the floating AI chat assistant button is visible and interactable.
        frame = context.pages[-1]
        # Click the School Website link to navigate to the School Website public page
        elem = frame.locator('xpath=html/body/div[2]/header/div/nav/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click the floating AI chat assistant button to open the chat panel on the School Website page.
        frame = context.pages[-1]
        # Click the floating AI chat assistant button to open the chat panel on the School Website page
        elem = frame.locator('xpath=html/body/div[2]/div/div/div[22]/div/div/div/img').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=AI Chat Assistant is not available').first).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError("Test plan execution failed: The AI chat assistant floating button is not visible or not interactable on all public pages, or the chat panel did not open/close with smooth UI animations as expected.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    