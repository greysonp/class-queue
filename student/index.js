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

                var name = $('#js-name').val();
                var question = $('#js-question').val();

                getFirebase().child('questions').push().set({
                    name: name,
                    question: question
                })
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
            });
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
