class ConversationDashboard {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000/api';
        this.conversationsList = document.getElementById('conversationsList');
        this.conversationDetail = document.getElementById('conversationDetail');
        this.conversationCount = document.getElementById('conversationCount');
        this.emptyState = document.getElementById('emptyState');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.conversationTitle = document.getElementById('conversationTitle');
        this.conversationDate = document.getElementById('conversationDate');
        this.messageCount = document.getElementById('messageCount');
        
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
        
        // Back to list button
        document.getElementById('backToList').addEventListener('click', () => {
            this.showConversationsList();
        });
    }
    
    async loadConversations() {
        try {
            this.showLoading();
            
            const response = await fetch(`${this.apiBaseUrl}/conversations`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to load conversations');
            }
            
            this.conversations = data.conversations;
            this.renderConversations();
            this.updateConversationCount();
            
        } catch (error) {
            console.error('Error loading conversations:', error);
            this.showError('Failed to load conversations. Please try again.');
        }
    }
    
    renderConversations() {
        if (this.conversations.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.hideEmptyState();
        this.conversationsList.innerHTML = '';
        
        this.conversations.forEach(conversation => {
            const conversationElement = this.createConversationElement(conversation);
            this.conversationsList.appendChild(conversationElement);
        });
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
            const response = await fetch(`${this.apiBaseUrl}/conversation/${conversation.id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete conversation');
            }
            
            // Remove from local array
            this.conversations = this.conversations.filter(conv => conv.id !== conversation.id);
            
            // Update UI
            this.renderConversations();
            this.updateConversationCount();
            
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
        // Create a temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Add to the top of the dashboard
        const dashboardMain = document.querySelector('.dashboard-main');
        dashboardMain.insertBefore(successDiv, dashboardMain.firstChild);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }
    
    showErrorMessage(message) {
        // Create a temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        
        // Add to the top of the dashboard
        const dashboardMain = document.querySelector('.dashboard-main');
        dashboardMain.insertBefore(errorDiv, dashboardMain.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
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
