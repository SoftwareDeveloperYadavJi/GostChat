const socket = io.connect('http://localhost:3000');

socket.on('connect', function() {
    console.log('Connected to the server');
});

socket.on('message', function(data) {
    displayMessage(data.id, data.text, data.file, data.type);
});


function sendMessage() {
    var messageInput = document.getElementById('message-input');
    var fileInput = document.getElementById('file-input');
    var message = messageInput.value.trim();
    var file = fileInput.files[0];

    if (message === '' && !file) {
        // No message or file to send
        return;
    }

    var chatBody = document.getElementById('chat-body');

    var messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'sent');

    // Generate a unique ID for the message
    var messageId = 'message-' + new Date().getTime();
    messageDiv.id = messageId;

    // Get the current time
    var time = new Date().toLocaleTimeString();

    var contentDiv = document.createElement('div');
    contentDiv.classList.add('content');

    var timeDiv = document.createElement('div');
    timeDiv.classList.add('time');
    timeDiv.innerText = time;

    if (message !== '') {
        contentDiv.innerText = message;
    }

    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var fileDataUrl = e.target.result;
            var fileType = file.type;

            if (fileType.startsWith('image/') || fileType === 'application/pdf') {
                // Emit the message to the server
                socket.emit('message', { text: message, file: fileDataUrl, type: fileType });

                if (fileType.startsWith('image/')) {
                    var img = document.createElement('img');
                    img.src = fileDataUrl;
                    img.style.maxWidth = '100px';
                    img.style.maxHeight = '100px';
                    contentDiv.appendChild(img);
                } else if (fileType === 'application/pdf') {
                    var link = document.createElement('a');
                    link.href = fileDataUrl;
                    link.download = file.name;
                    link.innerText = 'Download PDF';
                    contentDiv.appendChild(link);
                }
            }
        };
        reader.readAsDataURL(file);
    } else {
        // Emit the text message to the server
        socket.emit('message', { text: message, file: null, type: null });
    }

    messageDiv.appendChild(timeDiv);
    messageDiv.appendChild(contentDiv);
    chatBody.appendChild(messageDiv);

    // Scroll to the bottom of the chat
    chatBody.scrollTop = chatBody.scrollHeight;

    // Clear the message input
    messageInput.value = '';
    fileInput.value = '';

    // Remove the message after 30 seconds
    setTimeout(function() {
        removeMessage(messageId);
    }, 30000);
}

function displayMessage(messageId, text, file, type) {
    var chatBody = document.getElementById('chat-body');

    var messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'received');
    messageDiv.id = messageId;

    // Get the current time
    var time = new Date().toLocaleTimeString();

    var contentDiv = document.createElement('div');
    contentDiv.classList.add('content');

    var timeDiv = document.createElement('div');
    timeDiv.classList.add('time');
    timeDiv.innerText = time;

    if (text !== '') {
        contentDiv.innerText = text;
    }

    if (file && type) {
        if (type.startsWith('image/')) {
            var img = document.createElement('img');
            img.src = file;
            img.style.maxWidth = '100px';
            img.style.maxHeight = '100px';
            contentDiv.appendChild(img);
        } else if (type === 'application/pdf') {
            var link = document.createElement('a');
            link.href = file;
            link.download = 'download.pdf';
            link.innerText = 'Download PDF';
            contentDiv.appendChild(link);
        }
    }

    messageDiv.appendChild(timeDiv);
    messageDiv.appendChild(contentDiv);
    chatBody.appendChild(messageDiv);

    // Scroll to the bottom of the chat
    chatBody.scrollTop = chatBody.scrollHeight;

    // Remove the message after 30 seconds
    setTimeout(function() {
        removeMessage(messageId);
    }, 15000);
}


function removeMessage(messageId) {
    var messageDiv = document.getElementById(messageId);
    if (messageDiv) {
        messageDiv.remove();
    }
}

function createRoom() {
    var roomCode = document.getElementById('room-code-input').value.trim();

    if (roomCode === '') {
        // Room code is required to create a room
        alert('Please enter a room code.');
        return;
    }

    // Join the room
    socket.emit('createRoom', roomCode);
}


document.getElementById('message-input').addEventListener('keydown', function(event) {
    // Check if Enter key is pressed
    if (event.key === 'Enter') {
        // Prevent the default behavior (newline)
        event.preventDefault();

        // Call the function to send the message
        sendMessage();
    }
});

