(function() {

    init();

    function init() {
        getFirebase().child('session_key').on('value', function(snapshot) {
            renderLoginPage(snapshot.val());
        });
    }

    function renderLoginPage(sessionKey) {
        render('page/login.html', function() {
            $('#js-form').submit(function(e) {
                var userInput = $('#js-session-key').val();
                if (sessionKey === userInput) {
                    e.preventDefault();
                    renderAskPage();
                } else {
                    alert('try again');
                }
            });
        });
    }

    function renderAskPage() {
        render('page/ask.html', function() {

            // Submit event
            $('#js-form').submit(function(e) {
                e.preventDefault();
                var computerNumber = $('#js-computer-number').val();

                getFirebase().child('questions').push().set({
                    name: 'Not set',
                    question: 'Not set',
                    computer_number: computerNumber,
                    time: Firebase.ServerValue.TIMESTAMP
                });
            });

            // Render question list
            var source = $("#js-questions-template").html();
            var template = Handlebars.compile(source);
            getFirebase().child('questions').on('value', function(snapshot) {
                var questions = snapshot.val();
                var html = template({
                    questions: questions
                });
                $('#js-questions').html(html);
                updateTimestamps();
            });

            // Keep time display correct
            setInterval(updateTimestamps, 1000);
        });
    }

    function updateTimestamps() {
        $('.timestamp').each(function() {
            var timestamp = Math.floor(parseInt($(this).data('time'))/1000);
            var now = Math.floor(Date.now()/1000);
            var minutes = Math.floor((now - timestamp)/60);
            var seconds = (now - timestamp) % 60;

            var text = '';

            if (minutes <= 0) {
                if (seconds == 1) {
                    text = seconds + ' second ago.';
                } else {
                    text = seconds + ' seconds ago.';
                }
            } else {
                if (minutes == 1) {
                    if (seconds == 1) {
                        text = minutes + ' minute and ' + seconds + ' second ago.';
                    } else {
                        text = minutes + ' minute and ' + seconds + ' seconds ago.';
                    }
                } else {
                    if (seconds == 1) {
                        text = minutes + ' minutes and ' + seconds + ' second ago.';
                    } else {
                        text = minutes + ' minutes and ' + seconds + ' seconds ago.';
                    }
                }
            }

            $(this).text(text);
        });
    }

    function render(page, callback) {
        $.get(page, function(data) {
            $('#js-container').html(data);
            callback();
        });
    }

    function getFirebase() {
        return new Firebase('https://class-queue.firebaseio.com/');
    }

})();
