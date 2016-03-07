(function() {

    init();

    function init() {
        getFirebase().child('teacher_password').on('value', function(snapshot) {
            renderLoginPage(snapshot.val());
        });
    }

    function renderLoginPage(sessionKey) {
        render('page/login.html', function() {
            $('#js-form').submit(function(e) {
                var userInput = $('#js-teacher-password').val();
                if (sessionKey === userInput) {
                    e.preventDefault();
                    renderDashboard();
                } else {
                    alert('try again');
                }
            });
        });
    }

    function renderDashboard() {
        render('page/dashboard.html', function() {

            // Submit event
            $('#js-form').submit(function(e) {
                e.preventDefault();

                var sessionKey = $('#js-session-key').val();
                getFirebase().child('session_key').set(sessionKey);
            });

            // Render question list
            var source = $("#js-questions-template").html();
            var template = Handlebars.compile(source);
            getFirebase().child('questions').on('value', function(snapshot) {
                var questions = formatQuestionSnapshot(snapshot.val());

                var html = template({
                    questions: questions
                });
                $('#js-questions').html(html);

                $('#js-questions .remove-btn').click(function() {
                    var key = $(this).data('key');
                    getFirebase().child('questions').child(key).remove();
                });
            });
        });
    }

    function formatQuestionSnapshot(obj) {
        var questions = [];
        for (var key in obj) {
            var q = {
                key: key,
                name: obj[key].name,
                question: obj[key].question
            };
            questions.push(q);
        }
        return questions;
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
