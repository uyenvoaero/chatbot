(() => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('message-input');
  const messages = document.getElementById('messages');

  const FIXED_REPLY = "Hi! I'm your minimal bot. Thanks for your message. 💙💗";

  function appendMessage(role, text) {
    const wrapper = document.createElement('div');
    wrapper.className = `message message--${role}`;

    const avatar = document.createElement('div');
    avatar.className = `avatar avatar--${role}`;
    avatar.textContent = role === 'bot' ? 'B' : 'U';

    const bubble = document.createElement('div');
    bubble.className = `bubble bubble--${role}`;
    bubble.textContent = text;

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    appendMessage('user', text);
    input.value = '';

    setTimeout(() => {
      appendMessage('bot', FIXED_REPLY);
    }, 350);
  }

  form.addEventListener('submit', handleSubmit);

  // Seed a welcome message
  appendMessage('bot', "Hello! Ask me anything.");
})();

