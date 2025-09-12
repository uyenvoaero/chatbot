class ConversationDashboard {
    constructor() {
        this.apiBaseUrl = '/api';
        this.conversationsList = document.getElementById('conversationsList');
        this.conversationDetail = document.getElementById('conversationDetail');
        this.analysisSection = document.getElementById('analysisSection');
        this.conversationCount = document.getElementById('conversationCount');
        this.analysisCount = document.getElementById('analysisCount');
        this.emptyState = document.getElementById('emptyState');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.conversationTitle = document.getElementById('conversationTitle');
        this.conversationDate = document.getElementById('conversationDate');
        this.messageCount = document.getElementById('messageCount');
        this.analysisTableBody = document.getElementById('analysisTableBody');
        this.searchInput = document.getElementById('searchInput');
        
        this.currentConversation = null;
        this.conversations = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadConversations();
    }
    
    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadConversations();
        });
        // Tabs
        const tabConversations = document.getElementById('tabConversations');
        const tabAnalysis = document.getElementById('tabAnalysis');
        tabConversations.addEventListener('click', () => this.showTab('conversations'));
        tabAnalysis.addEventListener('click', () => this.showTab('analysis'));
        // Toolbar actions
        const clearAllBtn = document.getElementById('clearAllBtn');
        if (clearAllBtn) clearAllBtn.addEventListener('click', () => this.clearAllConversations());
        if (this.searchInput) this.searchInput.addEventListener('input', () => this.renderConversations());
        
        // Back to list button
        document.getElementById('backToList').addEventListener('click', () => {
            this.showConversationsList();
        });
    }
    
    async loadConversations() {
        try {
            console.log('=== LOADING CONVERSATIONS ===');
            console.log('API Base URL:', this.apiBaseUrl);
            console.log('Full URL:', `${this.apiBaseUrl}/conversations`);
            
            this.showLoading();
            
            const response = await fetch(`${this.apiBaseUrl}/conversations`);
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            let data;
            try {
                data = await response.json();
                console.log('Response data:', data);
            } catch (jsonError) {
                console.error('Failed to parse response JSON:', jsonError);
                const responseText = await response.text();
                console.log('Raw response text:', responseText);
                throw new Error(`Invalid response format: ${responseText}`);
            }
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to load conversations');
            }
            
            this.conversations = data.conversations;
            console.log('Loaded conversations:', this.conversations.length);
            this.renderConversations();
            this.updateConversationCount();
            this.renderAnalysisTable();
            
        } catch (error) {
            console.error('Error loading conversations:', error);
            this.showError('Failed to load conversations. Please try again.');
        }
    }

    showTab(tab) {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => btn.classList.remove('active'));
        if (tab === 'conversations') {
            document.getElementById('tabConversations').classList.add('active');
            this.analysisSection.style.display = 'none';
            this.conversationsList.parentElement.style.display = 'flex';
            this.conversationDetail.style.display = 'none';
        } else {
            document.getElementById('tabAnalysis').classList.add('active');
            this.conversationsList.parentElement.style.display = 'none';
            this.conversationDetail.style.display = 'none';
            this.analysisSection.style.display = 'block';
        }
    }

    renderAnalysisTable() {
        if (!this.analysisTableBody) return;
        const analyzed = this.conversations.filter(c => c.leadAnalysis && c.leadAnalysis.leadQuality);
        this.analysisCount.textContent = `${analyzed.length} analyzed`;
        this.analysisTableBody.innerHTML = '';
        analyzed.forEach(c => {
            const tr = document.createElement('tr');
            const la = c.leadAnalysis || {};
            tr.innerHTML = `
                <td>${c.id.substring(0,8)}...</td>
                <td>${this.formatDate(new Date(c.createdAt))}</td>
                <td><span class="lead-quality-badge ${la.leadQuality}">${la.leadQuality}</span></td>
                <td>${la.customerName || ''}</td>
                <td>${la.customerEmail || ''}</td>
                <td>${la.customerPhone || ''}</td>
                <td>${la.customerIndustry || ''}</td>
                <td>${la.customerConsultation ? 'Yes' : 'No'}</td>
                <td>${la.analysisDate ? this.formatDate(new Date(la.analysisDate)) : ''}</td>
            `;
            this.analysisTableBody.appendChild(tr);
        });
    }
    
    renderConversations() {
        const term = (this.searchInput?.value || '').toLowerCase();
        const list = term ? this.conversations.filter(c =>
            (c.firstMessage || '').toLowerCase().includes(term) ||
            (c.lastMessage || '').toLowerCase().includes(term) ||
            (c.id || '').toLowerCase().includes(term)
        ) : this.conversations;
        if (list.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.hideEmptyState();
        this.conversationsList.innerHTML = '';
        
        list.forEach(conversation => {
            const conversationElement = this.createConversationElement(conversation);
            this.conversationsList.appendChild(conversationElement);
        });
    }

    async clearAllConversations() {
        if (!confirm('Clear all conversations? This cannot be undone.')) return;
        try {
            // client-side: iterate and delete
            const ids = this.conversations.map(c => c.id);
            for (const id of ids) {
                await fetch(`${this.apiBaseUrl}/conversation/${id}`, { method: 'DELETE' });
            }
            this.conversations = [];
            this.renderConversations();
            this.updateConversationCount();
            this.showSuccessMessage('All conversations cleared');
        } catch (e) {
            this.showErrorMessage('Failed to clear all conversations');
        }
    }
    
    createConversationElement(conversation) {
        const div = document.createElement('div');
        div.className = 'conversation-item';
        div.dataset.conversationId = conversation.id;
        
        const createdAt = new Date(conversation.createdAt);
        const updatedAt = new Date(conversation.updatedAt);
        
        // Check if analysis is completed
        const analysisCompleted = conversation.leadAnalysis?.analysisCompleted;
        const leadQuality = conversation.leadAnalysis?.leadQuality;
        
        div.innerHTML = `
            <div class="conversation-header">
                <span class="conversation-id">${conversation.id.substring(0, 8)}...</span>
                <div class="conversation-actions">
                    <span class="conversation-date">${this.formatDate(updatedAt)}</span>
                    ${analysisCompleted ? 
                        `<span class="lead-quality-badge ${leadQuality}">${leadQuality}</span>` : 
                        `<button class="analyze-btn" title="Analyze lead quality">
                            <i class="fas fa-chart-line"></i>
                        </button>`
                    }
                    <button class="delete-btn" title="Delete conversation">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="conversation-preview">
                <h4>First Message</h4>
                <p>${conversation.firstMessage}</p>
            </div>
            <div class="conversation-meta">
                <span class="message-count">
                    <i class="fas fa-comment"></i>
                    ${conversation.messageCount} messages
                </span>
                <span>Created: ${this.formatDate(createdAt)}</span>
            </div>
            ${analysisCompleted ? this.createLeadAnalysisDisplay(conversation.leadAnalysis) : ''}
        `;
        
        // Add click event for conversation selection
        div.addEventListener('click', (e) => {
            // Don't trigger selection if clicking on buttons
            if (!e.target.closest('.delete-btn') && !e.target.closest('.analyze-btn')) {
                this.selectConversation(conversation);
            }
        });
        
        // Add analyze button event listener
        const analyzeBtn = div.querySelector('.analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent conversation selection
                this.analyzeConversation(conversation);
            });
        }
        
        // Add delete button event listener
        const deleteBtn = div.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent conversation selection
            this.deleteConversation(conversation);
        });
        
        return div;
    }
    
    async selectConversation(conversation) {
        try {
            // Update active state
            document.querySelectorAll('.conversation-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-conversation-id="${conversation.id}"]`).classList.add('active');
            
            // Load conversation details
            const response = await fetch(`${this.apiBaseUrl}/conversation/${conversation.id}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to load conversation');
            }
            
            this.currentConversation = data.conversation;
            this.showConversationDetail(conversation);
            
        } catch (error) {
            console.error('Error loading conversation:', error);
            this.showError('Failed to load conversation details.');
        }
    }
    
    showConversationDetail(conversation) {
        // Update header
        this.conversationTitle.textContent = `Conversation ${conversation.id.substring(0, 8)}...`;
        this.conversationDate.textContent = `Last updated: ${this.formatDate(new Date(conversation.updatedAt))}`;
        this.messageCount.textContent = `${conversation.messageCount} messages`;
        
        // Render messages
        this.renderMessages(this.currentConversation);
        
        // Show detail view
        this.conversationDetail.style.display = 'flex';
    }
    
    renderMessages(messages) {
        this.messagesContainer.innerHTML = '';
        
        if (!messages || messages.length === 0) {
            this.messagesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comment-slash"></i>
                    <h3>No Messages</h3>
                    <p>This conversation doesn't have any messages yet.</p>
                </div>
            `;
            return;
        }
        
        messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            this.messagesContainer.appendChild(messageElement);
        });
        
        // Scroll to bottom
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    createMessageElement(message) {
        const div = document.createElement('div');
        div.className = `message ${message.role === 'user' ? 'user-message' : 'bot-message'}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        const icon = document.createElement('i');
        icon.className = message.role === 'user' ? 'fas fa-user' : 'fas fa-robot';
        avatar.appendChild(icon);
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageText = document.createElement('p');
        messageText.textContent = message.content;
        content.appendChild(messageText);
        
        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = this.getCurrentTime();
        content.appendChild(time);
        
        div.appendChild(avatar);
        div.appendChild(content);
        
        return div;
    }
    
    async analyzeConversation(conversation) {
        try {
            // Show loading state
            const analyzeBtn = document.querySelector(`[data-conversation-id="${conversation.id}"] .analyze-btn`);
            if (analyzeBtn) {
                analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                analyzeBtn.disabled = true;
            }
            
            const response = await fetch(`${this.apiBaseUrl}/conversation/${conversation.id}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to analyze conversation');
            }
            
            const result = await response.json();
            
            // Update the conversation in local array
            const convIndex = this.conversations.findIndex(conv => conv.id === conversation.id);
            if (convIndex !== -1) {
                this.conversations[convIndex].leadAnalysis = {
                    ...result.analysis,
                    analysisCompleted: true,
                    analysisDate: new Date().toISOString()
                };
            }
            
            // Re-render conversations to show the analysis
            this.renderConversations();
            
            // Show success message
            this.showSuccessMessage(`Lead analysis completed! Quality: ${result.analysis.leadQuality}`);
            
        } catch (error) {
            console.error('Error analyzing conversation:', error);
            this.showErrorMessage('Failed to analyze conversation. Please try again.');
            
            // Reset button state
            const analyzeBtn = document.querySelector(`[data-conversation-id="${conversation.id}"] .analyze-btn`);
            if (analyzeBtn) {
                analyzeBtn.innerHTML = '<i class="fas fa-chart-line"></i>';
                analyzeBtn.disabled = false;
            }
        }
    }
    
    createLeadAnalysisDisplay(leadAnalysis) {
        if (!leadAnalysis) return '';
        
        return `
            <div class="lead-analysis-display">
                <div class="analysis-header">
                    <h4><i class="fas fa-user-tie"></i> Lead Analysis</h4>
                    <span class="lead-quality-badge ${leadAnalysis.leadQuality}">${leadAnalysis.leadQuality}</span>
                </div>
                <div class="analysis-content">
                    ${leadAnalysis.customerName ? `<div class="analysis-item"><strong>Name:</strong> ${leadAnalysis.customerName}</div>` : ''}
                    ${leadAnalysis.customerEmail ? `<div class="analysis-item"><strong>Email:</strong> ${leadAnalysis.customerEmail}</div>` : ''}
                    ${leadAnalysis.customerPhone ? `<div class="analysis-item"><strong>Phone:</strong> ${leadAnalysis.customerPhone}</div>` : ''}
                    ${leadAnalysis.customerIndustry ? `<div class="analysis-item"><strong>Industry:</strong> ${leadAnalysis.customerIndustry}</div>` : ''}
                    ${leadAnalysis.customerProblem ? `<div class="analysis-item"><strong>Problem/Need:</strong> ${leadAnalysis.customerProblem}</div>` : ''}
                    ${leadAnalysis.customerAvailability ? `<div class="analysis-item"><strong>Availability:</strong> ${leadAnalysis.customerAvailability}</div>` : ''}
                    ${leadAnalysis.customerConsultation ? `<div class="analysis-item"><strong>Consultation Booked:</strong> Yes</div>` : ''}
                    ${leadAnalysis.specialNotes ? `<div class="analysis-item"><strong>Notes:</strong> ${leadAnalysis.specialNotes}</div>` : ''}
                </div>
            </div>
        `;
    }
    
    async deleteConversation(conversation) {
        // Show confirmation dialog
        const confirmed = confirm(
            `Are you sure you want to delete this conversation?\n\n` +
            `Conversation ID: ${conversation.id.substring(0, 8)}...\n` +
            `Messages: ${conversation.messageCount}\n\n` +
            `This action cannot be undone.`
        );
        
        if (!confirmed) {
            return;
        }
        
        try {
            console.log('=== FRONTEND DELETE DEBUG ===');
            console.log('Attempting to delete conversation:', conversation.id);
            console.log('Full conversation object:', conversation);
            console.log('API URL:', `${this.apiBaseUrl}/conversation/${conversation.id}`);
            console.log('API Base URL:', this.apiBaseUrl);
            
            const deleteUrl = `${this.apiBaseUrl}/conversation/${conversation.id}`;
            console.log('Final delete URL:', deleteUrl);
            
            const response = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Delete response status:', response.status);
            console.log('Delete response headers:', response.headers);
            
            let responseData;
            try {
                responseData = await response.json();
                console.log('Delete response data:', responseData);
            } catch (jsonError) {
                console.error('Failed to parse response JSON:', jsonError);
                const responseText = await response.text();
                console.log('Raw response text:', responseText);
                throw new Error(`Invalid response format: ${responseText}`);
            }
            
            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to delete conversation');
            }
            
            // Remove from local array
            this.conversations = this.conversations.filter(conv => conv.id !== conversation.id);
            
            // Update UI
            this.renderConversations();
            this.updateConversationCount();
            this.renderAnalysisTable();
            
            // If this was the currently selected conversation, hide detail view
            if (this.currentConversation && this.currentConversation.id === conversation.id) {
                this.showConversationsList();
            }
            
            // Show success message
            this.showSuccessMessage('Conversation deleted successfully!');
            
        } catch (error) {
            console.error('Error deleting conversation:', error);
            this.showErrorMessage('Failed to delete conversation. Please try again.');
        }
    }
    
    showConversationsList() {
        this.conversationDetail.style.display = 'none';
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        this.currentConversation = null;
    }
    
    showLoading() {
        this.conversationsList.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading conversations...</p>
            </div>
        `;
    }
    
    showError(message) {
        this.conversationsList.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button onclick="location.reload()" class="cta-button" style="margin-top: 1rem;">
                    <i class="fas fa-refresh"></i> Retry
                </button>
            </div>
        `;
    }
    
    showSuccessMessage(message) {
        this.showToast(message, 'success');
    }
    
    showErrorMessage(message) {
        this.showToast(message, 'error');
    }
    
    showEmptyState() {
        this.emptyState.style.display = 'flex';
        this.conversationsList.style.display = 'none';
    }
    
    hideEmptyState() {
        this.emptyState.style.display = 'none';
        this.conversationsList.style.display = 'flex';
    }
    
    updateConversationCount() {
        const count = this.conversations.length;
        this.conversationCount.textContent = `${count} conversation${count !== 1 ? 's' : ''}`;
    }
    
    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) {
            return 'Just now';
        } else if (minutes < 60) {
            return `${minutes}m ago`;
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else if (days < 7) {
            return `${days}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
    
    getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

	getToastContainer() {
		let container = document.getElementById('toastContainer');
		if (!container) {
			container = document.createElement('div');
			container.id = 'toastContainer';
			container.className = 'toast-container';
			document.body.appendChild(container);
		}
		return container;
	}

	showToast(message, type = 'success') {
		const container = this.getToastContainer();
		const toast = document.createElement('div');
		toast.className = `toast ${type === 'success' ? 'toast-success' : 'toast-error'}`;
		toast.innerHTML = `
			<i class="${type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'}"></i>
			<span>${message}</span>
		`;
		container.appendChild(toast);
		setTimeout(() => {
			toast.classList.add('hide');
			setTimeout(() => {
				if (toast.parentNode) toast.parentNode.removeChild(toast);
			}, 300);
		}, type === 'success' ? 2500 : 4000);
	}
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ConversationDashboard();
});

// Add some utility functions for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Auto-refresh conversations every 30 seconds
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            const dashboard = window.conversationDashboard;
            if (dashboard && !dashboard.currentConversation) {
                dashboard.loadConversations();
            }
        }
    }, 30000);
    
    // Store dashboard instance globally for auto-refresh
    window.conversationDashboard = new ConversationDashboard();
});
