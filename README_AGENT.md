# AI Coding Agent - Python Implementation

## Overview

This is a Python-based AI coding agent that can understand existing codebases and implement product requirements with minimal user guidance. Built for the AI Coding Agent Assignment.

## Features

- **Automated Repository Exploration:** Systematically analyzes codebase structure
- **Intelligent Planning:** Creates execution plans based on user requirements
- **Safe Code Modification:** Makes targeted, backward-compatible changes
- **Cross-Language:** Can modify code in different languages (Python agent modifying JavaScript)
- **Self-Contained:** No external dependencies beyond Python standard library

## Requirements

- Python 3.11 or higher
- Target repository cloned locally

## Usage

### Basic Usage

```bash
# Navigate to the directory containing the agent and repository
cd ConversAIlabs

# Run the agent
python ai_coding_agent.py
```

### Custom Usage

To use with different repositories or requests, modify the `main()` function in `ai_coding_agent.py`:

```python
def main():
    repo_path = "your-repository-path"  # Change this
    user_request = "your specific request"  # Change this
    
    agent = AICodingAgent(repo_path)
    result = agent.run(user_request)
```

## Agent Architecture

### Class Structure

```python
class AICodingAgent:
    def __init__(repo_path, llm_api_key=None)
    def explore_repository() -> Dict[str, Any]
    def create_execution_plan(user_request) -> List[Dict[str, str]]
    def modify_codebase() -> List[Dict[str, str]]
    def summarize_changes() -> Dict[str, Any]
    def run(user_request) -> Dict[str, Any]
```

### Workflow

1. **Exploration:** Analyzes repository structure and identifies key files
2. **Planning:** Creates execution plan based on user request
3. **Modification:** Executes code changes using pattern matching
4. **Summary:** Generates comprehensive execution report

## Example Output

```
[AGENT] ============================================================
[AGENT] AI CODING AGENT - STARTING EXECUTION
[AGENT] ============================================================
[AGENT] Starting repository exploration...
[AGENT] Exploration complete. Found 277 key files.
[AGENT] Creating execution plan for request: Improve the application so users can better organise and search their notes.
[AGENT] Created execution plan with 5 steps
[AGENT] Starting codebase modifications...
[AGENT] Step 1: Add tags field to Note model for categorization
[AGENT] Step 2: Update controller to handle tags in create/update operations
[AGENT] Step 3: Add tag filtering to findAll method
[AGENT] Step 4: Implement search functionality across title, content, and tags
[AGENT] Step 5: Add search endpoint to routes
[AGENT] Completed 5 modifications
[AGENT] Summary: 3 files modified, 5 changes made
[AGENT] ============================================================
[AGENT] AI CODING AGENT - EXECUTION COMPLETE
[AGENT] ============================================================
```

## Implementation Details

### Repository Exploration

The agent uses:
- **pathlib** for cross-platform file system operations
- **Pattern matching** to identify key files
- **Content analysis** to determine project type and framework

### Code Modification

The agent uses:
- **String pattern matching** to locate code sections
- **Precise replacement** to preserve existing functionality
- **Idempotent operations** (safe to run multiple times)

### Technology Detection

Automatically detects:
- Project type (Node.js, Python, etc.)
- Frameworks (Express.js, Django, etc.)
- Databases (MongoDB, PostgreSQL, etc.)
- Architecture patterns (MVC, REST API, etc.)

## Demonstration

The agent was tested on the node-easy-notes-app repository:

**Task:** "Improve the application so users can better organise and search their notes."

**Results:**
- ✅ Added tags field to Note model
- ✅ Updated controller to handle tags
- ✅ Added tag filtering functionality
- ✅ Implemented full-text search
- ✅ Added search endpoint
- ✅ All tests passed

## File Structure

```
ConversAIlabs/
├── ai_coding_agent.py              # Main agent implementation
├── node-easy-notes-app/            # Target repository
│   ├── app/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   ├── config/
│   ├── server.js
│   └── package.json
└── README_AGENT.md                 # This file
```

## Extending the Agent

### Adding New Modification Patterns

To add new code modification capabilities:

1. Add a new method to the `AICodingAgent` class
2. Use string pattern matching to locate code
3. Apply modifications using string replacement
4. Add the step to the execution plan logic

Example:

```python
def _add_new_feature(self) -> Dict[str, str]:
    file_path = self.repo_path / 'path/to/file.js'
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    old_pattern = "old code"
    new_pattern = "new code"
    
    if old_pattern in content:
        content = content.replace(old_pattern, new_pattern)
        with open(file_path, 'w') as f:
            f.write(content)
        
        return {
            'file': 'path/to/file.js',
            'change': 'Added new feature',
            'status': 'success'
        }
    
    return {
        'file': 'path/to/file.js',
        'change': 'Feature already exists',
        'status': 'skipped'
    }
```

### Adding New Framework Support

To support new frameworks or languages:

1. Update `_identify_key_files()` to recognize framework-specific files
2. Enhance `_analyze_project()` to detect the new framework
3. Add modification patterns specific to the framework
4. Update execution plan logic for framework-specific requirements

## Limitations

1. **Pattern-Based:** Relies on string pattern matching, may not handle all code styles
2. **No LLM Integration:** Current implementation uses rule-based logic
3. **JavaScript/Node.js Focus:** Tested primarily on Node.js repositories
4. **Simple Modifications:** Designed for straightforward feature additions

## Future Enhancements

1. **LLM Integration:** Add OpenAI/Anthropic API for intelligent analysis
2. **AST-Based Modification:** Use abstract syntax trees for precise code changes
3. **Multi-Language Support:** Expand support for Python, Java, Go, etc.
4. **Automated Testing:** Add test generation and validation
5. **Git Integration:** Automatic commit handling
6. **Rollback Capability:** Ability to undo changes if needed

## License

This agent was built for interview/assignment purposes.

## Author

Built as part of AI Coding Agent Assignment interview process.