const responseDiv = document.getElementById('response');

responseDiv.innerHTML = '<span>You: ' + prompt + '</span><br>';
responseDiv.innerHTML += '<span>Bot: ' + response + '</span><br>';

const userMessage = document.createElement('div');
userMessage.id = 'message_' + messageId.toString();
userMessage.classList.add('user-message');
userMessage.textContent = 'You: ' + prompt + '\n';
responseDiv.appendChild(userMessage);