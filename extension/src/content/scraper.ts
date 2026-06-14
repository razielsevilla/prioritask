// Pinnacle LMS Scraper for PrioriTask
// Matches: https://pinnacle.pnc.edu.ph/*

import { type Assignment } from '../types/models';

console.log('PrioriTask: Scraper injected into Pinnacle LMS.');

// A basic regex to find common date formats (e.g., "10/24/2026", "Oct 24", "2026-10-24")
const DATE_REGEX = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|([A-Za-z]{3}\s\d{1,2},?\s\d{4})|(\d{4}-\d{2}-\d{2})/g;

export const scrapeAssignments = (): Partial<Assignment>[] => {
  const scrapedTasks: Partial<Assignment>[] = [];
  
  // Strategy 1: Look for explicit assignment wrappers or table rows.
  // Since we don't know the exact Pinnacle DOM yet, we'll try common classes.
  const potentialContainers = document.querySelectorAll('tr, .assignment-item, .task-row, li');
  
  potentialContainers.forEach((container) => {
    const textContent = container.textContent || '';
    
    // If the container has a date in it, it might be an assignment
    const dateMatch = textContent.match(DATE_REGEX);
    
    if (dateMatch && dateMatch.length > 0) {
      // Try to find an anchor tag or bold text for the title
      const titleElement = container.querySelector('a, h2, h3, h4, strong, .title');
      const title = titleElement ? titleElement.textContent?.trim() : textContent.substring(0, 50).trim() + '...';
      
      // Basic due date parsing
      const parsedDate = new Date(dateMatch[0]);
      
      if (!isNaN(parsedDate.getTime()) && title && title.length > 2) {
        scrapedTasks.push({
          title: `[LMS] ${title}`,
          dueAt: parsedDate.toISOString(),
          tShirtSize: 'M', // Default size
          course: 'Pinnacle LMS',
        });
      }
    }
  });

  // Deduplicate tasks based on title
  const uniqueTasks = Array.from(new Map(scrapedTasks.map(item => [item.title, item])).values());
  
  console.log('PrioriTask: Found tasks:', uniqueTasks);
  return uniqueTasks;
};

// Listen for messages from the Popup to trigger the scrape
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'SCRAPE_LMS') {
    const tasks = scrapeAssignments();
    sendResponse({ success: true, tasks });
  }
  return true;
});
