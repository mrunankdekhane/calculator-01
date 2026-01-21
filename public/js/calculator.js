class Calculator {
    constructor(previousEl, currentEl) {
        this.previousEl = previousEl;
        this.currentEl = currentEl;
        this.clear();
        this.loadRecentHistory();
    }

    clear() {
        this.current = '0';
        this.previous = '';
        this.operation = undefined;
        this.updateDisplay();
    }

    delete() {
        if (this.current === '0') return;
        this.current = this.current.slice(0, -1);
        if (this.current === '' || this.current === '-') {
            this.current = '0';
        }
        this.updateDisplay();
    }

    appendNumber(num) {
        if (num === '.' && this.current.includes('.')) return;
        if (this.current === '0' && num !== '.') {
            this.current = num;
        } else {
            this.current += num;
        }
        this.updateDisplay();
    }

    chooseOperation(op) {
        if (this.current === '') return;
        if (this.previous !== '') {
            this.compute();
        }
        this.operation = op;
        this.previous = this.current + ' ' + op;
        this.current = '0';
        this.updateDisplay();
    }

    async compute() {
        let result;
        const prev = parseFloat(this.previous);
        const curr = parseFloat(this.current);
        
        if (isNaN(prev) || isNaN(curr)) return;
        
        switch (this.operation) {
            case '+':
                result = prev + curr;
                break;
            case '-':
                result = prev - curr;
                break;
            case '×':
                result = prev * curr;
                break;
            case '÷':
                result = prev / curr;
                break;
            default:
                return;
        }
        
        const expression = `${prev} ${this.operation} ${curr}`;
        
        // Save to database
        await this.saveCalculation(expression, result);
        
        this.current = result.toString();
        this.operation = undefined;
        this.previous = '';
        this.updateDisplay();
        
        // Reload recent history
        this.loadRecentHistory();
    }

    updateDisplay() {
        this.currentEl.textContent = this.current;
        this.previousEl.textContent = this.previous;
    }

    async saveCalculation(expression, result) {
        try {
            await fetch('/api/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ expression, result })
            });
        } catch (error) {
            console.error('Error saving calculation:', error);
        }
    }

    async loadRecentHistory() {
        try {
            const response = await fetch('/api/history');
            const calculations = await response.json();
            
            const recentList = document.getElementById('recent-list');
            if (calculations.length === 0) {
                recentList.innerHTML = '<p style="color: #999; text-align: center;">No history yet</p>';
            } else {
                recentList.innerHTML = calculations.map(calc => `
                    <div class="recent-item">
                        <div class="expression">${calc.expression}</div>
                        <div class="result">= ${calc.result}</div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }
}

const calc = new Calculator(
    document.getElementById('previous'),
    document.getElementById('current')
);

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') calc.appendNumber(e.key);
    if (e.key === '.') calc.appendNumber('.');
    if (e.key === '+' || e.key === '-') calc.chooseOperation(e.key);
    if (e.key === '*') calc.chooseOperation('×');
    if (e.key === '/') {
        e.preventDefault();
        calc.chooseOperation('÷');
    }
    if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calc.compute();
    }
    if (e.key === 'Backspace') calc.delete();
    if (e.key === 'Escape') calc.clear();
});