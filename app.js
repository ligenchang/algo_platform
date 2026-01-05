let editor;
let pyodide;
let isDebugMode = false;

// User subscription state (in real app, this would come from backend)
let userState = {
    isLoggedIn: false,
    email: null,
    tier: 'free', // 'free', 'pro', 'enterprise'
    executionsToday: 0,
    maxExecutions: 10,
    features: {
        cloudStorage: false,
        codeSharing: false,
        aiAssist: false,
        advancedDebug: false,
        unlimitedExecutions: false
    }
};

// Tier configurations
const tierConfigs = {
    free: {
        name: 'Free',
        maxExecutions: 10,
        features: {
            cloudStorage: false,
            codeSharing: false,
            aiAssist: false,
            advancedDebug: true, // Enable for free tier
            unlimitedExecutions: false
        }
    },
    pro: {
        name: 'Pro',
        maxExecutions: -1, // unlimited
        features: {
            cloudStorage: true,
            codeSharing: true,
            aiAssist: false,
            advancedDebug: true,
            unlimitedExecutions: true
        }
    },
    enterprise: {
        name: 'Enterprise',
        maxExecutions: -1,
        features: {
            cloudStorage: true,
            codeSharing: true,
            aiAssist: true,
            advancedDebug: true,
            unlimitedExecutions: true
        }
    }
};

// Initialize Monaco Editor
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: `# Welcome to Python Code Editor!
# Write your Python code here with full syntax intelligence

users = {'Hans': 'active', 'Éléonore': 'inactive', '景太郎': 'active'}

print(id(users))
print()

c = users.copy()
print(id(c))
`,
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: true },
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: false,
        cursorStyle: 'line',
        renderWhitespace: 'selection',
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        wordBasedSuggestions: true,
        folding: true,
        foldingStrategy: 'indentation',
        showFoldingControls: 'always',
        bracketPairColorization: { enabled: true },
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function() {
        runCode();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function() {
        saveCode();
    });
    
    updateUI();
    renderSavedList();
});

// Initialize Pyodide
async function initPyodide() {
    updateStatus('Loading Python...', 'running');
    try {
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
        });
        
        await pyodide.runPythonAsync(`
import sys
import io
import traceback

class OutputCapture:
    def __init__(self):
        self.output = []
    
    def write(self, text):
        if text is not None:
            self.output.append(text)
    
    def flush(self):
        pass
    
    def get_output(self):
        return ''.join(self.output)

sys.stdout = OutputCapture()
sys.stderr = OutputCapture()
        `);
        
        updateStatus('Ready', 'success');
        appendOutput('✓ Python environment loaded successfully!\n', 'success');
    } catch (error) {
        updateStatus('Error', 'error');
        appendOutput(`Failed to load Python: ${error.message}`, 'error');
    }
}

// Check execution limits
function canExecute() {
    if (userState.features.unlimitedExecutions) {
        return true;
    }
    
    if (userState.executionsToday >= userState.maxExecutions) {
        return false;
    }
    
    return true;
}

// Run Python code
async function runCode() {
    // Check execution limits
    if (!canExecute()) {
        appendOutput('❌ Daily execution limit reached!', 'error');
        appendOutput(`Upgrade to Pro for unlimited executions.`, 'error');
        openPricingModal();
        return;
    }

    if (!pyodide) {
        await initPyodide();
    }

    const code = editor.getValue();
    if (!code.trim()) {
        appendOutput('No code to run!', 'error');
        return;
    }

    clearOutput();
    updateStatus('Running...', 'running');
    
    try {
        await pyodide.runPythonAsync(`
    sys.stdout = OutputCapture()
    sys.stderr = OutputCapture()
    # Mark this globals as user code
    globals()['__USER_CODE_FLAG'] = True
        `);

        const startTime = performance.now();
        await pyodide.runPythonAsync(code);
        const endTime = performance.now();
        const executionTime = (endTime - startTime).toFixed(2);

        const stdout = await pyodide.runPythonAsync('sys.stdout.get_output()');
        const stderr = await pyodide.runPythonAsync('sys.stderr.get_output()');

        if (stdout) {
            appendOutput(stdout, 'success');
        }
        
        if (stderr) {
            appendOutput(stderr, 'error');
        }

        if (!stdout && !stderr) {
            appendOutput('✓ Code executed successfully (no output)', 'success');
        }

        appendOutput(`\n⏱️  Execution time: ${executionTime}ms`, 'success');
        updateStatus('Success', 'success');

        // Increment execution count
        if (!userState.features.unlimitedExecutions) {
            userState.executionsToday++;
            updateUI();
        }

        if (isDebugMode) {
            await showDebugInfo();
        }

    } catch (error) {
        updateStatus('Error', 'error');
        
        // Get any output that was printed before the error
        try {
            const stdout = await pyodide.runPythonAsync('sys.stdout.get_output()');
            const stderr = await pyodide.runPythonAsync('sys.stderr.get_output()');
            
            if (stdout) {
                appendOutput(stdout, 'success');
                appendOutput('\n--- Error occurred below ---\n', 'error');
            }
            
            if (stderr) {
                appendOutput(stderr, 'error');
            } else {
                appendOutput(`Error: ${error.message}`, 'error');
            }
        } catch {
            appendOutput(`Error: ${error.message}`, 'error');
        }
    }
}

// Debug mode
async function toggleDebug() {
    isDebugMode = !isDebugMode;
    const debugBtn = document.getElementById('debugBtn');
    
    if (isDebugMode) {
        debugBtn.innerHTML = '<i class="fas fa-bug"></i> Debug: ON';
        debugBtn.style.background = '#ff9800';
        appendDebug('🐛 Debug mode enabled - will show variables after execution');
    } else {
        debugBtn.innerHTML = '<i class="fas fa-bug"></i> Debug';
        debugBtn.style.background = '#f59e0b';
        clearDebug();
        appendDebug('Debug mode disabled');
    }
}

// Show debug information
async function showDebugInfo() {
    clearDebug();
    appendDebug('=== Debug Information ===\n');
    appendDebug('💡 Note: Use "Advanced" button to trace function execution and see variable values during runtime\n');
    
    try {
        const debugInfo = await pyodide.runPythonAsync(`
import json
import sys

def get_debug_info():
    debug_data = {
        'globals': {},
        'functions': {}
    }

    user_flag = globals().get('__USER_CODE_FLAG', False)

    # Get global variables and functions that belong to user code
    for name, value in globals().items():
        # Skip internal items
        if name.startswith('_') or name in ['sys', 'io', 'traceback', 'OutputCapture', 'json', 'get_debug_info']:
            continue

        try:
            is_user = False
            # If we set a global flag, treat as user code
            if user_flag:
                is_user = True
            # If object is a function defined in __main__, treat as user
            if callable(value) and hasattr(value, '__code__') and getattr(value, '__module__', None) == '__main__':
                is_user = True

            if not is_user:
                continue

            # Check if it's a function
            if callable(value) and hasattr(value, '__code__'):
                code_obj = value.__code__
                all_vars = list(code_obj.co_varnames)
                param_count = code_obj.co_argcount
                debug_data['functions'][name] = {
                    'name': name,
                    'args': all_vars[:param_count] if param_count > 0 else [],
                    'local_vars': all_vars[param_count:] if len(all_vars) > param_count else [],
                    'line': code_obj.co_firstlineno,
                }
            else:
                # It's a user variable
                type_name = type(value).__name__
                value_str = str(value)
                if len(value_str) > 300:
                    value_str = value_str[:300] + '...'
                debug_data['globals'][name] = {
                    'type': type_name,
                    'value': value_str
                }
        except Exception:
            continue

    return json.dumps(debug_data)

get_debug_info()
        `);

        const data = JSON.parse(debugInfo);
        
        // Display global variables
        if (Object.keys(data.globals).length > 0) {
            appendDebug('📦 Global Variables:\n');
            for (const [name, info] of Object.entries(data.globals)) {
                appendDebug(`  ${name} (${info.type}): ${info.value}\n`);
            }
        } else {
            appendDebug('📦 No global variables\n');
        }
        
        appendDebug('');
        
        // Display functions
        if (Object.keys(data.functions).length > 0) {
            appendDebug('🔧 Functions Defined:\n');
            for (const [name, info] of Object.entries(data.functions)) {
                const args = info.args.join(', ');
                appendDebug(`  ${info.name}(${args}) - Line ${info.line}`);
                
                if (info.local_vars.length > 0) {
                    appendDebug(`    Local variables: ${info.local_vars.join(', ')}`);
                }
                
                appendDebug(`    ℹ️  ${info.note}\n`);
            }
        } else {
            appendDebug('🔧 No functions defined');
        }
        
    } catch (error) {
        appendDebug(`Error getting debug info: ${error.message}`);
    }
}

// Advanced Debug with function tracing
async function advancedDebug() {
    // Re-run code with tracing enabled
    if (!pyodide) {
        alert('Please run your code first!');
        return;
    }
    
    clearDebug();
    appendDebug('=== Advanced Debug - Function Call Trace ===\n');
    
    try {
        const code = editor.getValue();
        
        // Setup trace function and re-run code (capture exceptions and locals)
        const traceResult = await pyodide.runPythonAsync(`
import sys
import json
import traceback

trace_log = []
call_stack = []
last_vars = {}

def safe_str(v):
    try:
        return str(v)[:200]
    except:
        return '<unable to display>'

def trace_calls(frame, event, arg):
    func_name = frame.f_code.co_name

    # Skip frames that are not from the executed user code to avoid library internals
    try:
        filename = frame.f_code.co_filename
    except:
        filename = None
    if filename != '<exec>':
        return trace_calls

    # Skip helper/internal functions defined in the tracer itself
    helper_names = set(['trace_calls', 'safe_str', 'OutputCapture'])
    if func_name in helper_names or func_name.startswith('_'):
        return trace_calls

    if event == 'call':
        local_vars = {k: safe_str(v) for k, v in frame.f_locals.items()}
        call_stack.append(func_name)
        last_vars[func_name] = local_vars.copy()
        trace_log.append({
            'event': 'call',
            'function': func_name,
            'line': frame.f_lineno,
            'locals': local_vars,
            'depth': len(call_stack)
        })

    elif event == 'line':
        local_vars = {k: safe_str(v) for k, v in frame.f_locals.items()}
        changed = {}
        if func_name in last_vars:
            for k, v in local_vars.items():
                if k not in last_vars[func_name] or last_vars[func_name][k] != v:
                    changed[k] = v
        else:
            changed = local_vars

        if changed:
            trace_log.append({
                'event': 'line',
                'function': func_name,
                'line': frame.f_lineno,
                'locals': local_vars,
                'changed': changed,
                'depth': len(call_stack)
            })
            last_vars[func_name] = local_vars.copy()

    elif event == 'return':
        if call_stack and call_stack[-1] == func_name:
            call_stack.pop()

        return_value = safe_str(arg) if arg is not None else 'None'
        trace_log.append({
            'event': 'return',
            'function': func_name,
            'line': frame.f_lineno,
            'return_value': return_value,
            'depth': len(call_stack) + 1
        })

        if func_name in last_vars:
            del last_vars[func_name]

    return trace_calls

# Clear previous output
sys.stdout = OutputCapture()
sys.stderr = OutputCapture()

# Run code with tracing and capture exceptions
exc_info = None
sys.settrace(trace_calls)
try:
${code.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    # Capture exception details and locals at point of exception
    tb = traceback.format_exc()
    exc_frame = sys.exc_info()[2]
    # Walk to the last frame
    last_frame = exc_frame
    while last_frame and last_frame.tb_next:
        last_frame = last_frame.tb_next
    if last_frame:
        f = last_frame.tb_frame
        func = f.f_code.co_name
        local_vars = {k: safe_str(v) for k, v in f.f_locals.items()}
        trace_log.append({
            'event': 'exception',
            'function': func,
            'line': f.f_lineno,
            'locals': local_vars,
            'traceback': tb,
            'depth': len(call_stack)
        })
    exc_info = tb
finally:
    sys.settrace(None)

# Include exception info at the end if present
result = {'trace': trace_log, 'exception': exc_info}
json.dumps(result)
        `);
        
        const result = JSON.parse(traceResult);
        const traces = result.trace || [];

        if (traces.length === 0) {
            appendDebug('No function calls detected');
        } else {
            appendDebug(`Total trace events: ${traces.length}\n`);

            for (const trace of traces) {
                const indent = '  '.repeat(Math.max(0, (trace.depth || 1) - 1));

                if (trace.event === 'call') {
                    appendDebug(`${indent}→ ${trace.function}() called at line ${trace.line}`);

                    if (trace.locals && Object.keys(trace.locals).length > 0) {
                        for (const [varName, varValue] of Object.entries(trace.locals)) {
                            appendDebug(`${indent}  ${varName} = ${varValue}`);
                        }
                    }
                    appendDebug('');
                } else if (trace.event === 'line') {
                    appendDebug(`${indent}  Line ${trace.line}:`);
                    if (trace.changed) {
                        for (const [varName, varValue] of Object.entries(trace.changed)) {
                            appendDebug(`${indent}    ${varName} = ${varValue}`);
                        }
                    }
                    appendDebug('');
                } else if (trace.event === 'return') {
                    appendDebug(`${indent}← ${trace.function}() returned: ${trace.return_value}\n`);
                } else if (trace.event === 'exception') {
                    appendDebug(`${indent}‼️ Exception in ${trace.function} at line ${trace.line}`);
                    if (trace.locals && Object.keys(trace.locals).length > 0) {
                        appendDebug(`${indent}  Locals at exception:`);
                        for (const [varName, varValue] of Object.entries(trace.locals)) {
                            appendDebug(`${indent}    ${varName} = ${varValue}`);
                        }
                    }
                    if (trace.traceback) {
                        appendDebug(`${indent}  Traceback:`);
                        appendDebug(trace.traceback);
                    }
                    appendDebug('');
                }
            }
        }

        // If overall exception captured, show summary
        if (result.exception) {
            appendDebug('\n=== Exception Summary ===');
            appendDebug(result.exception);
        }
        
    } catch (error) {
        appendDebug(`Error during advanced debug: ${error.message}`);
    }
}

// Subscription Management
function updateUI() {
    // Update tier badge
    const tierBadge = document.getElementById('tierBadge');
    const bannerText = document.getElementById('bannerText');
    
    tierBadge.textContent = `${userState.tier.toUpperCase()} TIER`;
    
    if (userState.tier === 'free') {
        bannerText.textContent = 'Unlock unlimited executions and advanced debugging with Pro!';
    } else if (userState.tier === 'pro') {
        bannerText.textContent = '⭐ Pro Member - Enjoying unlimited executions!';
    } else {
        bannerText.textContent = '👑 Enterprise Member - Full access to all features!';
    }
    
    // Update execution count
    const executionCount = document.getElementById('executionCount');
    if (userState.features.unlimitedExecutions) {
        executionCount.textContent = '∞';
    } else {
        executionCount.textContent = `${userState.executionsToday}/${userState.maxExecutions}`;
    }
    
    // Update pro features availability
    document.querySelectorAll('.pro-feature').forEach(btn => {
        const feature = btn.id.replace('Btn', '').replace('advanced', '').replace('Debug', '');
        
        if (btn.id === 'shareBtn' && !userState.features.codeSharing) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        } else if (btn.id === 'aiAssistBtn' && !userState.features.aiAssist) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        }
    });
}

function selectTier(tier) {
    if (tier === 'free') {
        alert('You are already on the Free tier!');
        return;
    }
    
    // Show payment modal
    const modal = document.getElementById('paymentModal');
    const selectedPlan = document.getElementById('selectedPlan');
    
    const prices = { pro: '$9', enterprise: '$29' };
    selectedPlan.innerHTML = `
        <h3>${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan</h3>
        <p style="font-size: 24px; color: #6366f1; margin-top: 10px;">${prices[tier]}/month</p>
    `;
    
    modal.style.display = 'block';
    closePricingModal();
    
    // Store selected tier for form submission
    modal.dataset.selectedTier = tier;
}

// Modal functions
function openPricingModal() {
    document.getElementById('pricingModal').style.display = 'block';
}

function closePricingModal() {
    document.getElementById('pricingModal').style.display = 'none';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

// Scroll to features section
function scrollToFeatures(event) {
    event.preventDefault();
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Payment form submission
document.addEventListener('DOMContentLoaded', function() {
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const modal = document.getElementById('paymentModal');
            const tier = modal.dataset.selectedTier;
            
            // Simulate payment processing
            alert('Payment processing... (Demo only)');
            
            // Upgrade user tier
            upgradeTier(tier);
            
            closePaymentModal();
        });
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            
            // Simulate login
            userState.isLoggedIn = true;
            userState.email = email;
            
            alert(`Welcome back, ${email}!`);
            updateUI();
            closeLoginModal();
        });
    }
});

function upgradeTier(tier) {
    userState.tier = tier;
    userState.maxExecutions = tierConfigs[tier].maxExecutions;
    userState.features = { ...tierConfigs[tier].features };
    userState.executionsToday = 0; // Reset on upgrade
    
    updateUI();
    
    appendOutput(`\n🎉 Successfully upgraded to ${tier.charAt(0).toUpperCase() + tier.slice(1)}!`, 'success');
    appendOutput('Enjoy your new features!', 'success');
}

// File management
function saveCode() {
    const code = editor.getValue();
    const filename = prompt('Enter filename (without .py extension):', 'my_code');

    if (!filename) return;

    // If logged in, try to save to server
    if (userState.isLoggedIn) {
        // Attempt server save
        fetch('/api/code/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // In real app send Authorization header with token
            },
            body: JSON.stringify({ filename, code })
        }).then(res => res.json()).then(data => {
            if (data && data.success) {
                appendOutput(`✓ Code saved to server as "${filename}" (id: ${data.codeId})`, 'success');
                updateStatus('Saved to server', 'success');
                // Also add to local registry for quick listing
                addToLocalRegistry(filename);
                renderSavedList();
            } else {
                // Fallback to local save
                localStorage.setItem(`python_code_${filename}`, code);
                addToLocalRegistry(filename);
                appendOutput(`⚠️ Server save failed — saved locally as "${filename}"`, 'error');
                updateStatus('Saved (local fallback)', 'warning');
                renderSavedList();
            }
        }).catch(err => {
            localStorage.setItem(`python_code_${filename}`, code);
            addToLocalRegistry(filename);
            appendOutput(`⚠️ Server save error — saved locally as "${filename}"`, 'error');
            updateStatus('Saved (local fallback)', 'warning');
            renderSavedList();
        });
    } else {
        // Anonymous user — save locally
        localStorage.setItem(`python_code_${filename}`, code);
        addToLocalRegistry(filename);
        updateFileMetadata(filename);
        appendOutput(`✓ Code saved locally as "${filename}"!`, 'success');
        updateStatus('Saved', 'success');
        renderSavedList();
    }
}

// Maintain a simple registry of saved filenames for listing
function getLocalRegistry() {
    const raw = localStorage.getItem('python_code_registry');
    return raw ? JSON.parse(raw) : [];
}

function addToLocalRegistry(filename) {
    const list = getLocalRegistry();
    const entry = {
        name: filename,
        timestamp: Date.now(),
        lines: 0
    };
    
    // Remove existing entry if present
    const filtered = list.filter(item => item.name !== filename);
    filtered.unshift(entry); // Add to beginning
    localStorage.setItem('python_code_registry', JSON.stringify(filtered));
}

function updateFileMetadata(filename) {
    const code = localStorage.getItem(`python_code_${filename}`);
    if (!code) return;
    
    const lines = code.split('\n').length;
    const list = getLocalRegistry();
    const entry = list.find(item => item.name === filename);
    if (entry) {
        entry.lines = lines;
        entry.timestamp = Date.now();
        localStorage.setItem('python_code_registry', JSON.stringify(list));
    }
}

function renderSavedList(searchQuery = '') {
    const container = document.getElementById('savedList');
    const countEl = document.getElementById('savedCount');
    if (!container) return;
    container.innerHTML = '';

    let list = getLocalRegistry();
    
    // Filter by search query
    if (searchQuery) {
        list = list.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    // Update count
    if (countEl) {
        countEl.textContent = `${list.length} file${list.length !== 1 ? 's' : ''}`;
    }

    if (list.length === 0) {
        const emptyMsg = searchQuery 
            ? `<i class="fas fa-search"></i>No files match "${searchQuery}"`
            : '<i class="fas fa-folder-open"></i>No saved files yet. Click "Save" to get started!';
        container.innerHTML = `<div class="saved-empty">${emptyMsg}</div>`;
        return;
    }

    for (const item of list) {
        const name = item.name || item; // Support old format
        const timestamp = item.timestamp || Date.now();
        const lines = item.lines || 0;
        
        const card = document.createElement('div');
        card.className = 'saved-file-card';
        card.setAttribute('data-filename', name);
        
        const header = document.createElement('div');
        header.className = 'saved-file-header';
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-file-code saved-file-icon';
        
        const nameEl = document.createElement('div');
        nameEl.className = 'saved-file-name';
        nameEl.textContent = name;
        nameEl.title = name;
        nameEl.contentEditable = false;
        nameEl.ondblclick = (e) => {
            e.stopPropagation();
            startInlineRename(nameEl, name);
        };
        
        const actions = document.createElement('div');
        actions.className = 'saved-file-actions';
        
        const renameBtn = document.createElement('button');
        renameBtn.className = 'saved-file-action';
        renameBtn.innerHTML = '<i class="fas fa-edit"></i>';
        renameBtn.title = 'Rename (or double-click name)';
        renameBtn.onclick = (e) => {
            e.stopPropagation();
            startInlineRename(nameEl, name);
        };
        
        const duplicateBtn = document.createElement('button');
        duplicateBtn.className = 'saved-file-action';
        duplicateBtn.innerHTML = '<i class="fas fa-copy"></i>';
        duplicateBtn.title = 'Duplicate';
        duplicateBtn.onclick = (e) => {
            e.stopPropagation();
            duplicateSavedCode(name);
        };
        
        const exportBtn = document.createElement('button');
        exportBtn.className = 'saved-file-action';
        exportBtn.innerHTML = '<i class="fas fa-download"></i>';
        exportBtn.title = 'Export';
        exportBtn.onclick = (e) => {
            e.stopPropagation();
            exportSavedCode(name);
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'saved-file-action delete';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Delete';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteSavedCode(name);
        };
        
        actions.appendChild(renameBtn);
        actions.appendChild(duplicateBtn);
        actions.appendChild(exportBtn);
        actions.appendChild(deleteBtn);
        
        header.appendChild(icon);
        header.appendChild(nameEl);
        header.appendChild(actions);
        
        const meta = document.createElement('div');
        meta.className = 'saved-file-meta';
        
        const info = document.createElement('div');
        info.className = 'saved-file-info';
        info.innerHTML = `<i class="fas fa-code"></i> ${lines} lines`;
        
        const date = document.createElement('div');
        date.className = 'saved-file-date';
        date.textContent = formatTimestamp(timestamp);
        date.title = new Date(timestamp).toLocaleString();
        
        meta.appendChild(info);
        meta.appendChild(date);
        
        card.appendChild(header);
        card.appendChild(meta);
        
        card.onclick = () => loadSavedCode(name);
        
        container.appendChild(card);
    }
}

function formatTimestamp(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function startInlineRename(nameEl, oldName) {
    nameEl.contentEditable = true;
    nameEl.classList.add('editing');
    nameEl.focus();
    
    // Select all text
    const range = document.createRange();
    range.selectNodeContents(nameEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    
    const finishRename = () => {
        const newName = nameEl.textContent.trim();
        nameEl.contentEditable = false;
        nameEl.classList.remove('editing');
        
        if (newName && newName !== oldName) {
            performRename(oldName, newName);
        } else {
            nameEl.textContent = oldName;
        }
    };
    
    nameEl.onblur = finishRename;
    nameEl.onkeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            finishRename();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            nameEl.textContent = oldName;
            nameEl.blur();
        }
    };
}

function performRename(oldName, newName) {
    const code = localStorage.getItem(`python_code_${oldName}`);
    if (!code) {
        alert('File not found!');
        return;
    }
    
    // Save with new name
    localStorage.setItem(`python_code_${newName}`, code);
    
    // Remove old file
    localStorage.removeItem(`python_code_${oldName}`);
    
    // Update registry
    const list = getLocalRegistry();
    const entry = list.find(item => item.name === oldName);
    if (entry) {
        entry.name = newName;
        localStorage.setItem('python_code_registry', JSON.stringify(list));
    }
    
    appendOutput(`✓ Renamed "${oldName}" to "${newName}"`, 'success');
    renderSavedList();
}

function duplicateSavedCode(name) {
    const code = localStorage.getItem(`python_code_${name}`);
    if (!code) {
        alert('File not found!');
        return;
    }
    
    let newName = `${name}_copy`;
    let counter = 1;
    
    // Find unique name
    while (localStorage.getItem(`python_code_${newName}`)) {
        newName = `${name}_copy${counter}`;
        counter++;
    }
    
    localStorage.setItem(`python_code_${newName}`, code);
    addToLocalRegistry(newName);
    updateFileMetadata(newName);
    
    appendOutput(`✓ Duplicated "${name}" as "${newName}"`, 'success');
    renderSavedList();
}

function exportSavedCode(name) {
    const code = localStorage.getItem(`python_code_${name}`);
    if (!code) {
        alert('File not found!');
        return;
    }
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.py`;
    a.click();
    URL.revokeObjectURL(url);
    
    appendOutput(`✓ Exported "${name}.py"`, 'success');
}

function exportAllFiles() {
    const list = getLocalRegistry();
    if (list.length === 0) {
        alert('No files to export!');
        return;
    }
    
    // Create a zip-like structure (simple concatenation with separators)
    let allContent = `# CodeFlow Pro - Exported Files (${new Date().toLocaleString()})\n`;
    allContent += `# Total files: ${list.length}\n\n`;
    allContent += '=' .repeat(80) + '\n\n';
    
    for (const item of list) {
        const name = item.name || item;
        const code = localStorage.getItem(`python_code_${name}`);
        if (code) {
            allContent += `# File: ${name}.py\n`;
            allContent += '# ' + '-'.repeat(76) + '\n\n';
            allContent += code;
            allContent += '\n\n' + '='.repeat(80) + '\n\n';
        }
    }
    
    const blob = new Blob([allContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codeflow_export_${Date.now()}.py`;
    a.click();
    URL.revokeObjectURL(url);
    
    appendOutput(`✓ Exported all ${list.length} files`, 'success');
}

function deleteSavedCode(name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    
    // Remove from storage
    localStorage.removeItem(`python_code_${name}`);
    
    // Update registry
    const list = getLocalRegistry();
    const filtered = list.filter(item => {
        const itemName = item.name || item;
        return itemName !== name;
    });
    localStorage.setItem('python_code_registry', JSON.stringify(filtered));
    
    appendOutput(`✓ Deleted "${name}"`, 'success');
    renderSavedList();
}

function loadSavedCode(name) {
    // Try local storage first
    const code = localStorage.getItem(`python_code_${name}`);
    if (code) {
        editor.setValue(code);
        updateStatus('Loaded', 'success');
        appendOutput(`✓ Loaded "${name}"`, 'success');
        
        // Update metadata
        updateFileMetadata(name);
        return;
    }

    // If logged in, attempt server fetch (not implemented in demo server)
    if (userState.isLoggedIn) {
        fetch(`/api/code/${encodeURIComponent(name)}`).then(res => res.json()).then(data => {
            if (data && data.code) {
                editor.setValue(data.code);
                updateStatus('Loaded from server', 'success');
                appendOutput(`✓ Loaded "${name}" from server`, 'success');
            } else {
                alert('File not found on server');
            }
        }).catch(err => {
            alert('Error fetching file from server');
        });
    } else {
        alert(`File "${name}" not found locally.`);
    }
}

function loadFromFile() {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();
    
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                editor.setValue(event.target.result);
                updateStatus('Loaded', 'success');
                appendOutput(`✓ Loaded code from "${file.name}"`, 'success');
            };
            reader.readAsText(file);
        }
    };
}

function downloadCode() {
    const code = editor.getValue();
    const filename = prompt('Enter filename for download:', 'code.py');
    
    if (filename) {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.endsWith('.py') ? filename : filename + '.py';
        a.click();
        URL.revokeObjectURL(url);
        updateStatus('Downloaded', 'success');
    }
}

// Pro features with gates
function shareCode() {
    if (!userState.features.codeSharing) {
        alert('Code sharing is a Pro feature! Upgrade to share your code.');
        openPricingModal();
        return;
    }
    
    alert('Share feature: Generate shareable link (Demo)');
}

function aiAssist() {
    if (!userState.features.aiAssist) {
        alert('AI Assistant is an Enterprise feature! Upgrade to get AI-powered help.');
        openPricingModal();
        return;
    }
    
    alert('AI Assistant: Get code suggestions (Demo)');
}

// UI Helper functions
function updateStatus(text, status) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = text;
    statusEl.className = 'status';
    if (status) statusEl.classList.add(status);
}

function appendOutput(text, type = 'normal') {
    const outputEl = document.getElementById('output');
    const line = document.createElement('div');
    line.className = `output-line ${type === 'error' ? 'output-error' : type === 'success' ? 'output-success' : ''}`;
    line.textContent = text;
    outputEl.appendChild(line);
    outputEl.scrollTop = outputEl.scrollHeight;
}

function clearOutput() {
    document.getElementById('output').innerHTML = '';
}

function appendDebug(text) {
    const debugEl = document.getElementById('debugInfo');
    const line = document.createElement('div');
    line.className = 'debug-line';
    line.textContent = text;
    debugEl.appendChild(line);
    debugEl.scrollTop = debugEl.scrollHeight;
}

function clearDebug() {
    document.getElementById('debugInfo').innerHTML = '';
}

// Event listeners
document.getElementById('runBtn').addEventListener('click', runCode);
document.getElementById('debugBtn').addEventListener('click', toggleDebug);
document.getElementById('clearBtn').addEventListener('click', () => {
    clearOutput();
    clearDebug();
    updateStatus('Ready', 'success');
});
document.getElementById('saveBtn').addEventListener('click', saveCode);
document.getElementById('loadBtn').addEventListener('click', loadFromFile);
document.getElementById('downloadBtn').addEventListener('click', downloadCode);
document.getElementById('shareBtn').addEventListener('click', shareCode);
document.getElementById('aiAssistBtn').addEventListener('click', aiAssist);
document.getElementById('advancedDebugBtn').addEventListener('click', advancedDebug);
document.getElementById('loginBtn').addEventListener('click', () => {
    document.getElementById('loginModal').style.display = 'block';
});
document.getElementById('upgradeBtn').addEventListener('click', openPricingModal);
document.getElementById('refreshListBtn').addEventListener('click', renderSavedList);

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

// Initialize on page load
window.addEventListener('load', () => {
    appendOutput('🚀 CodeFlow Pro - Premium Python IDE', 'success');
    appendOutput('💡 Tips:', 'success');
    appendOutput('  • Press Cmd/Ctrl+Enter to run code', 'success');
    appendOutput('  • Press Cmd/Ctrl+S to save code', 'success');
    appendOutput('  • Click "Debug" to see variables after execution', 'success');
    appendOutput('  • Upgrade to Pro for unlimited executions!\n', 'success');
    updateStatus('Ready', 'success');
    updateUI();
});

// Initialize Pyodide
async function initPyodide() {
    updateStatus('Loading Python...', 'running');
    try {
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
        });
        
        await pyodide.runPythonAsync(`
import sys
import io
import traceback

class OutputCapture:
    def __init__(self):
        self.output = []
    
    def write(self, text):
        if text is not None:
            self.output.append(text)
    
    def flush(self):
        pass
    
    def get_output(self):
        return ''.join(self.output)

sys.stdout = OutputCapture()
sys.stderr = OutputCapture()
        `);
        
        updateStatus('Ready', 'success');
        appendOutput('✓ Python environment loaded successfully!\n', 'success');
    } catch (error) {
        updateStatus('Error', 'error');
        appendOutput(`Failed to load Python: ${error.message}`, 'error');
    }
}

// Check execution limits
function canExecute() {
    if (userState.features.unlimitedExecutions) {
        return true;
    }
    
    if (userState.executionsToday >= userState.maxExecutions) {
        return false;
    }
    
    return true;
}

// UI Helper functions
function updateStatus(text, status) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = text;
    statusEl.className = 'status';
    if (status) statusEl.classList.add(status);
}

function appendOutput(text, type = 'normal') {
    const outputEl = document.getElementById('output');
    const line = document.createElement('div');
    line.className = `output-line ${type === 'error' ? 'output-error' : type === 'success' ? 'output-success' : ''}`;
    line.textContent = text;
    outputEl.appendChild(line);
    outputEl.scrollTop = outputEl.scrollHeight;
}

function clearOutput() {
    document.getElementById('output').innerHTML = '';
}

function appendDebug(text) {
    const debugEl = document.getElementById('debugInfo');
    const line = document.createElement('div');
    line.className = 'debug-line';
    line.textContent = text;
    debugEl.appendChild(line);
    debugEl.scrollTop = debugEl.scrollHeight;
}

function clearDebug() {
    document.getElementById('debugInfo').innerHTML = '';
}

// Initialize on page load
window.addEventListener('load', () => {
    appendOutput('🚀 Python Code Editor Ready!', 'success');
    appendOutput('💡 Tips:', 'success');
    appendOutput('  • Press Cmd/Ctrl+Enter to run code', 'success');
    appendOutput('  • Press Cmd/Ctrl+S to save code', 'success');
    appendOutput('  • Click "Debug" to see variables after execution', 'success');
    appendOutput('  • Use autocomplete with Ctrl+Space\n', 'success');
    updateStatus('Ready', 'success');
});
