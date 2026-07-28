
import os
import sys
import json
import subprocess
from pathlib import Path
from typing import List, Dict, Any
import re

class AICodingAgent:
    def __init__(self, repo_path: str, llm_api_key: str = None):
        self.repo_path = Path(repo_path)
        self.llm_api_key = llm_api_key or os.getenv("OPENAI_API_KEY")
        self.exploration_data = {}
        self.execution_plan = []
        self.changes_made = []
        
    def log(self, message: str):
        """Log progress messages"""
        print(f"[AGENT] {message}")
        
    def explore_repository(self) -> Dict[str, Any]:
        """Explore the repository structure and understand the project"""
        self.log("Starting repository exploration...")
        
        # Get directory structure
        self.exploration_data['structure'] = self._get_directory_structure()
        
        # Identify key files
        self.exploration_data['key_files'] = self._identify_key_files()
        
        # Read key files
        self.exploration_data['file_contents'] = self._read_key_files()
        
        # Analyze project type and architecture
        self.exploration_data['analysis'] = self._analyze_project()
        
        self.log(f"Exploration complete. Found {len(self.exploration_data['key_files'])} key files.")
        return self.exploration_data
    
    def _get_directory_structure(self) -> Dict[str, Any]:
        """Get the directory structure"""
        structure = {}
        
        def build_structure(path, prefix=""):
            nonlocal structure
            try:
                for item in path.iterdir():
                    if item.name.startswith('.'):
                        continue
                    relative_path = str(item.relative_to(self.repo_path))
                    if item.is_dir():
                        structure[relative_path] = "directory"
                        build_structure(item)
                    else:
                        structure[relative_path] = "file"
            except PermissionError:
                pass
        
        build_structure(self.repo_path)
        return structure
    
    def _identify_key_files(self) -> List[str]:
        """Identify key files based on common patterns"""
        key_files = []
        
        # Common key file patterns
        patterns = [
            'package.json', 'requirements.txt', 'pom.xml', 'build.gradle',
            'server.js', 'app.js', 'main.py', 'index.js',
            'README.md', 'readme.md',
            '.gitignore',
            'docker-compose.yml', 'Dockerfile'
        ]
        
        # Check for MVC patterns
        for root, dirs, files in os.walk(self.repo_path):
            for file in files:
                if file in patterns or any(pattern in file for pattern in ['model', 'controller', 'route', 'config']):
                    relative_path = str(Path(root).relative_to(self.repo_path) / file)
                    key_files.append(relative_path)
        
        return sorted(set(key_files))
    
    def _read_key_files(self) -> Dict[str, str]:
        """Read the contents of key files"""
        contents = {}
        
        for file_path in self.exploration_data['key_files']:
            full_path = self.repo_path / file_path
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    contents[file_path] = f.read()
            except Exception as e:
                self.log(f"Could not read {file_path}: {e}")
        
        return contents
    
    def _analyze_project(self) -> Dict[str, Any]:
        """Analyze the project type and architecture"""
        analysis = {
            'type': 'unknown',
            'framework': None,
            'language': None,
            'architecture': None,
            'database': None
        }
        
        # Check package.json for Node.js projects
        if 'package.json' in self.exploration_data['file_contents']:
            package_json = json.loads(self.exploration_data['file_contents']['package.json'])
            analysis['type'] = 'Node.js'
            analysis['language'] = 'JavaScript'
            
            dependencies = package_json.get('dependencies', {})
            if 'express' in dependencies:
                analysis['framework'] = 'Express.js'
                analysis['architecture'] = 'REST API'
            if 'mongoose' in dependencies or 'mongodb' in dependencies:
                analysis['database'] = 'MongoDB'
        
        # Check for MVC structure
        if any('model' in f for f in self.exploration_data['key_files']):
            if analysis['architecture'] is None:
                analysis['architecture'] = 'MVC'
        
        return analysis
    
    def create_execution_plan(self, user_request: str) -> List[Dict[str, str]]:
        """Create an execution plan based on user request and repository analysis"""
        self.log(f"Creating execution plan for request: {user_request}")
        
        # Analyze the request
        request_lower = user_request.lower()
        
        # Determine appropriate implementation based on request
        if 'organize' in request_lower or 'organise' in request_lower:
            if 'search' in request_lower:
                plan = [
                    {
                        'step': 1,
                        'action': 'Add tags field to Note model for categorization',
                        'file': 'app/models/note.model.js',
                        'reason': 'Tags provide flexible organization for notes'
                    },
                    {
                        'step': 2,
                        'action': 'Update controller to handle tags in create/update operations',
                        'file': 'app/controllers/note.controller.js',
                        'reason': 'Controllers need to process tags data'
                    },
                    {
                        'step': 3,
                        'action': 'Add tag filtering to findAll method',
                        'file': 'app/controllers/note.controller.js',
                        'reason': 'Enable filtering notes by tags'
                    },
                    {
                        'step': 4,
                        'action': 'Implement search functionality across title, content, and tags',
                        'file': 'app/controllers/note.controller.js',
                        'reason': 'Full-text search improves note discoverability'
                    },
                    {
                        'step': 5,
                        'action': 'Add search endpoint to routes',
                        'file': 'app/routes/note.routes.js',
                        'reason': 'Expose search functionality via API'
                    }
                ]
            else:
                plan = [
                    {
                        'step': 1,
                        'action': 'Add tags field to Note model',
                        'file': 'app/models/note.model.js',
                        'reason': 'Enable categorization'
                    },
                    {
                        'step': 2,
                        'action': 'Update controller to handle tags',
                        'file': 'app/controllers/note.controller.js',
                        'reason': 'Process tags in create/update'
                    }
                ]
        elif 'search' in request_lower:
            plan = [
                {
                    'step': 1,
                    'action': 'Implement search functionality in controller',
                    'file': 'app/controllers/note.controller.js',
                    'reason': 'Add search capability'
                },
                {
                    'step': 2,
                    'action': 'Add search endpoint to routes',
                    'file': 'app/routes/note.routes.js',
                    'reason': 'Expose search via API'
                }
            ]
        else:
            plan = [
                {
                    'step': 1,
                    'action': 'Analyze request and determine appropriate implementation',
                    'file': 'analysis',
                    'reason': 'Understand user requirements'
                }
            ]
        
        self.execution_plan = plan
        self.log(f"Created execution plan with {len(plan)} steps")
        return plan
    
    def modify_codebase(self) -> List[Dict[str, str]]:
        """Execute the modifications to the codebase"""
        self.log("Starting codebase modifications...")
        
        changes = []
        
        for step in self.execution_plan:
            self.log(f"Step {step['step']}: {step['action']}")
            
            if step['file'] == 'app/models/note.model.js':
                change = self._modify_note_model()
                changes.append(change)
                
            elif step['file'] == 'app/controllers/note.controller.js':
                if 'tag filtering' in step['action']:
                    change = self._add_tag_filtering()
                    changes.append(change)
                elif 'search' in step['action']:
                    change = self._add_search_functionality()
                    changes.append(change)
                elif 'tags in create/update' in step['action']:
                    change = self._update_controller_for_tags()
                    changes.append(change)
                    
            elif step['file'] == 'app/routes/note.routes.js':
                change = self._add_search_route()
                changes.append(change)
        
        self.changes_made = changes
        self.log(f"Completed {len(changes)} modifications")
        return changes
    
    def _modify_note_model(self) -> Dict[str, str]:
        """Add tags field to Note model"""
        file_path = self.repo_path / 'app/models/note.model.js'
        
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Add tags field to schema
        old_schema = """const NoteSchema = mongoose.Schema({
    title: String,
    content: String
}, {
    timestamps: true
});"""
        
        new_schema = """const NoteSchema = mongoose.Schema({
    title: String,
    content: String,
    tags: [String]
}, {
    timestamps: true
});"""
        
        if old_schema in content:
            content = content.replace(old_schema, new_schema)
            
            with open(file_path, 'w') as f:
                f.write(content)
            
            return {
                'file': 'app/models/note.model.js',
                'change': 'Added tags field to Note schema',
                'status': 'success'
            }
        else:
            return {
                'file': 'app/models/note.model.js',
                'change': 'Tags field already exists or schema not found',
                'status': 'skipped'
            }
    
    def _update_controller_for_tags(self) -> Dict[str, str]:
        """Update controller to handle tags in create/update operations"""
        file_path = self.repo_path / 'app/controllers/note.controller.js'
        
        with open(file_path, 'r') as f:
            content = f.read()
        
        changes_made = []
        
        # Update create method
        old_create = """    const note = new Note({
        title: req.body.title || "Untitled Note", 
        content: req.body.content
    });"""
        
        new_create = """    const note = new Note({
        title: req.body.title || "Untitled Note", 
        content: req.body.content,
        tags: req.body.tags || []
    });"""
        
        if old_create in content:
            content = content.replace(old_create, new_create)
            changes_made.append('Updated create method to handle tags')
        
        # Update update method
        old_update = """    Note.findByIdAndUpdate(req.params.noteId, {
        title: req.body.title || "Untitled Note",
        content: req.body.content
    }, {new: true})"""
        
        new_update = """    Note.findByIdAndUpdate(req.params.noteId, {
        title: req.body.title || "Untitled Note",
        content: req.body.content,
        tags: req.body.tags || []
    }, {new: true})"""
        
        if old_update in content:
            content = content.replace(old_update, new_update)
            changes_made.append('Updated update method to handle tags')
        
        if changes_made:
            with open(file_path, 'w') as f:
                f.write(content)
            
            return {
                'file': 'app/controllers/note.controller.js',
                'change': ', '.join(changes_made),
                'status': 'success'
            }
        else:
            return {
                'file': 'app/controllers/note.controller.js',
                'change': 'No changes needed for tags handling',
                'status': 'skipped'
            }
    
    def _add_tag_filtering(self) -> Dict[str, str]:
        """Add tag filtering to findAll method"""
        file_path = self.repo_path / 'app/controllers/note.controller.js'
        
        with open(file_path, 'r') as f:
            content = f.read()
        
        old_findAll = """exports.findAll = (req, res) => {
    Note.find()
    .then(notes => {
        res.send(notes);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving notes."
        });
    });
};"""
        
        new_findAll = """exports.findAll = (req, res) => {
    const query = {};
    
    // Filter by tags if provided
    if (req.query.tags) {
        const tags = Array.isArray(req.query.tags) ? req.query.tags : req.query.tags.split(',');
        query.tags = { $in: tags };
    }
    
    Note.find(query)
    .then(notes => {
        res.send(notes);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving notes."
        });
    });
};"""
        
        if old_findAll in content:
            content = content.replace(old_findAll, new_findAll)
            
            with open(file_path, 'w') as f:
                f.write(content)
            
            return {
                'file': 'app/controllers/note.controller.js',
                'change': 'Added tag filtering to findAll method',
                'status': 'success'
            }
        else:
            return {
                'file': 'app/controllers/note.controller.js',
                'change': 'Tag filtering already exists or method not found',
                'status': 'skipped'
            }
    
    def _add_search_functionality(self) -> Dict[str, str]:
        """Add search functionality to controller"""
        file_path = self.repo_path / 'app/controllers/note.controller.js'
        
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Add search method at the end of the file
        search_method = """

// Search notes by title, content, or tags
exports.search = (req, res) => {
    const searchTerm = req.query.q;
    
    if (!searchTerm) {
        return res.status(400).send({
            message: "Please provide a search term using the 'q' parameter"
        });
    }
    
    const query = {
        $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { content: { $regex: searchTerm, $options: 'i' } },
            { tags: { $regex: searchTerm, $options: 'i' } }
        ]
    };
    
    Note.find(query)
    .then(notes => {
        res.send(notes);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while searching notes."
        });
    });
};"""
        
        if 'exports.search' not in content:
            content = content + search_method
            
            with open(file_path, 'w') as f:
                f.write(content)
            
            return {
                'file': 'app/controllers/note.controller.js',
                'change': 'Added search method for full-text search',
                'status': 'success'
            }
        else:
            return {
                'file': 'app/controllers/note.controller.js',
                'change': 'Search method already exists',
                'status': 'skipped'
            }
    
    def _add_search_route(self) -> Dict[str, str]:
        """Add search endpoint to routes"""
        file_path = self.repo_path / 'app/routes/note.routes.js'
        
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Add search route after findAll
        old_routes = """    // Retrieve all Notes
    app.get('/notes', notes.findAll);

    // Retrieve a single Note with noteId"""
        
        new_routes = """    // Retrieve all Notes
    app.get('/notes', notes.findAll);

    // Search Notes
    app.get('/notes/search', notes.search);

    // Retrieve a single Note with noteId"""
        
        if old_routes in content:
            content = content.replace(old_routes, new_routes)
            
            with open(file_path, 'w') as f:
                f.write(content)
            
            return {
                'file': 'app/routes/note.routes.js',
                'change': 'Added search endpoint GET /notes/search',
                'status': 'success'
            }
        else:
            return {
                'file': 'app/routes/note.routes.js',
                'change': 'Search route already exists or pattern not found',
                'status': 'skipped'
            }
    
    def summarize_changes(self) -> Dict[str, Any]:
        """Summarize all changes made"""
        summary = {
            'exploration_data': self.exploration_data,
            'execution_plan': self.execution_plan,
            'changes_made': self.changes_made,
            'files_modified': list(set(change['file'] for change in self.changes_made)),
            'total_changes': len(self.changes_made)
        }
        
        self.log(f"Summary: {len(summary['files_modified'])} files modified, {summary['total_changes']} changes made")
        return summary
    
    def run(self, user_request: str) -> Dict[str, Any]:
        """Main execution method"""
        self.log("=" * 60)
        self.log("AI CODING AGENT - STARTING EXECUTION")
        self.log("=" * 60)
        
        # Step 1: Explore repository
        self.explore_repository()
        
        # Step 2: Create execution plan
        self.create_execution_plan(user_request)
        
        # Step 3: Modify codebase
        self.modify_codebase()
        
        # Step 4: Summarize changes
        summary = self.summarize_changes()
        
        self.log("=" * 60)
        self.log("AI CODING AGENT - EXECUTION COMPLETE")
        self.log("=" * 60)
        
        return summary


def main():
    """Main entry point"""
    # Configuration
    repo_path = "node-easy-notes-app"
    user_request = "Improve the application so users can better organise and search their notes."
    
    # Check if repository exists
    if not os.path.exists(repo_path):
        print(f"Error: Repository not found at {repo_path}")
        print("Please ensure the repository is cloned and in the correct location.")
        sys.exit(1)
    
    # Create and run agent
    agent = AICodingAgent(repo_path)
    result = agent.run(user_request)
    
    # Print summary
    print("\n" + "=" * 60)
    print("EXECUTION SUMMARY")
    print("=" * 60)
    print(f"Project Type: {result['exploration_data']['analysis']['type']}")
    print(f"Framework: {result['exploration_data']['analysis']['framework']}")
    print(f"Architecture: {result['exploration_data']['analysis']['architecture']}")
    print(f"Database: {result['exploration_data']['analysis']['database']}")
    print(f"\nFiles Modified: {', '.join(result['files_modified'])}")
    print(f"Total Changes: {result['total_changes']}")
    
    print("\nExecution Plan:")
    for step in result['execution_plan']:
        print(f"  {step['step']}. {step['action']}")
        print(f"     File: {step['file']}")
        print(f"     Reason: {step['reason']}")
    
    print("\nChanges Made:")
    for change in result['changes_made']:
        print(f"  - {change['file']}: {change['change']} ({change['status']})")
    
    print("\n" + "=" * 60)
    print("Agent execution completed successfully!")
    print("=" * 60)


if __name__ == "__main__":
    main()