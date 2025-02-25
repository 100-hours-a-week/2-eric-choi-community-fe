export class FormField {
    constructor(options = {}) {
        const { 
            type = 'text', 
            label, 
            name, 
            placeholder = '', 
            required = false,
            value = '',
            validator = null
        } = options;
        
        this.element = document.createElement('div');
        this.element.className = 'input-group';
        this.type = type;
        this.name = name;
        this.validator = validator;
        this.input = null;
        
        this.render(type, label, name, placeholder, required, value);
        if (validator) {
            this.setupValidation();
        }
    }

    render(type, label, name, placeholder, required, value) {
        this.element.innerHTML = `
            <label for="${name}">${label}${required ? '<span class="required">*</span>' : ''}</label>
            ${type === 'textarea' 
                ? `<textarea id="${name}" name="${name}" placeholder="${placeholder}">${value}</textarea>`
                : `<input type="${type}" id="${name}" name="${name}" value="${value}" placeholder="${placeholder}" ${required ? 'required' : ''}>`
            }
            <p class="helper-text"></p>
        `;
        
        this.input = this.element.querySelector(`#${name}`);
    }

    setupValidation() {
        this.input.addEventListener('input', () => {
            this.validate();
        });

        this.input.addEventListener('blur', () => {
            this.validate();
        });
    }

    validate() {
        if (!this.validator) return true;
        
        const value = this.getValue();
        const error = this.validator(value);
        const helperText = this.element.querySelector('.helper-text');
        
        if (error) {
            helperText.textContent = error;
            helperText.style.display = 'block';
            this.input.style.borderColor = 'var(--error)';
            return false;
        } else {
            helperText.style.display = 'none';
            this.input.style.borderColor = 'var(--border-color)';
            return true;
        }
    }

    getValue() {
        return this.input.value;
    }

    setValue(value) {
        this.input.value = value;
    }
}

export class Form {
    constructor(id, options = {}) {
        const { onSubmit, fields = [] } = options;
        
        this.element = document.getElementById(id);
        this.fields = {};
        this.onSubmit = onSubmit;
        
        if (!this.element) {
            console.error(`Form with id "${id}" not found`);
            return;
        }
        
        this.setupForm();
        this.addFields(fields);
    }
    
    setupForm() {
        this.element.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (this.validate() && this.onSubmit) {
                this.onSubmit(this.getValues());
            }
        });
    }
    
    addFields(fields) {
        fields.forEach(fieldConfig => {
            const field = new FormField(fieldConfig);
            this.element.appendChild(field.element);
            this.fields[fieldConfig.name] = field;
        });
    }
    
    addField(fieldConfig) {
        const field = new FormField(fieldConfig);
        this.element.appendChild(field.element);
        this.fields[fieldConfig.name] = field;
        return field;
    }
    
    validate() {
        let isValid = true;
        
        Object.values(this.fields).forEach(field => {
            if (field.validator && !field.validate()) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    getValues() {
        const values = {};
        
        Object.entries(this.fields).forEach(([name, field]) => {
            values[name] = field.getValue();
        });
        
        return values;
    }
    
    setValues(values) {
        Object.entries(values).forEach(([name, value]) => {
            if (this.fields[name]) {
                this.fields[name].setValue(value);
            }
        });
    }
    
    reset() {
        this.element.reset();
    }
}