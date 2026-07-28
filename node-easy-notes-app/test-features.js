const http = require('http');

function postData(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: JSON.parse(body) });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

function getData(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: JSON.parse(body) });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

async function runTests() {
  console.log('=== Testing Note Organization and Search Features ===\n');
  
  try {
    // Test 1: Create a note with tags
    console.log('Test 1: Creating a note with tags...');
    const note1 = await postData('/notes', {
      title: 'Meeting Notes',
      content: 'Discussion about project roadmap and planning',
      tags: ['work', 'meetings', 'planning']
    });
    console.log('Created note:', note1.body);
    console.log();

    // Test 2: Create another note with different tags
    console.log('Test 2: Creating another note with different tags...');
    const note2 = await postData('/notes', {
      title: 'Shopping List',
      content: 'Buy groceries: milk, eggs, bread',
      tags: ['personal', 'shopping']
    });
    console.log('Created note:', note2.body);
    console.log();

    // Test 3: Create a third note with overlapping tags
    console.log('Test 3: Creating a third note with overlapping tags...');
    const note3 = await postData('/notes', {
      title: 'Project Ideas',
      content: 'New features to implement in the application',
      tags: ['work', 'ideas']
    });
    console.log('Created note:', note3.body);
    console.log();

    // Test 4: Get all notes
    console.log('Test 4: Getting all notes...');
    const allNotes = await getData('/notes');
    console.log('All notes count:', allNotes.body.length);
    console.log('All notes:', JSON.stringify(allNotes.body, null, 2));
    console.log();

    // Test 5: Filter by tag
    console.log('Test 5: Filtering notes by tag "work"...');
    const workNotes = await getData('/notes?tags=work');
    console.log('Work notes count:', workNotes.body.length);
    console.log('Work notes:', JSON.stringify(workNotes.body, null, 2));
    console.log();

    // Test 6: Filter by multiple tags
    console.log('Test 6: Filtering notes by tags "work,meetings"...');
    const meetingNotes = await getData('/notes?tags=work,meetings');
    console.log('Meeting notes count:', meetingNotes.body.length);
    console.log('Meeting notes:', JSON.stringify(meetingNotes.body, null, 2));
    console.log();

    // Test 7: Search functionality
    console.log('Test 7: Searching for "planning"...');
    const searchResults = await getData('/notes/search?q=planning');
    console.log('Search results count:', searchResults.body.length);
    console.log('Search results:', JSON.stringify(searchResults.body, null, 2));
    console.log();

    // Test 8: Search in tags
    console.log('Test 8: Searching for "shopping" (in tags)...');
    const tagSearch = await getData('/notes/search?q=shopping');
    console.log('Tag search results count:', tagSearch.body.length);
    console.log('Tag search results:', JSON.stringify(tagSearch.body, null, 2));
    console.log();

    // Test 9: Search in content
    console.log('Test 9: Searching for "groceries" (in content)...');
    const contentSearch = await getData('/notes/search?q=groceries');
    console.log('Content search results count:', contentSearch.body.length);
    console.log('Content search results:', JSON.stringify(contentSearch.body, null, 2));
    console.log();

    console.log('=== All tests completed successfully! ===');

  } catch (error) {
    console.error('Error during testing:', error);
  }
}

runTests();