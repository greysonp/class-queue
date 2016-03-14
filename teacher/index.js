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

                updateTimestamps();
            });

            // Keep time display correct
            setInterval(updateTimestamps, 1000);
        });
        
        // Register service worker for push notification support
        if ('serviceWorker' in navigator) {
            console.log('Service Worker is supported');
            
            // Regiser
            navigator.serviceWorker.register('sw.js').then(function(reg) {
                console.log('Service worker registered!', reg);
            }).catch(function(err) {
                console.error('Service worker failed to register.', err);
            });
            
            // Listen for ready event to subscribe to notifications
            navigator.serviceWorker.ready.then(function(reg) {
                console.log('Service worker ready!');
                reg.pushManager.subscribe({
                    userVisibleOnly: true
                }).then(function(sub) {
                    var subId = getSubIdFromEndpoint(sub.endpoint);
                    getFirebase().child('subscription_ids').child(subId).set(true);
                });
            });
        }
    }
    
    function getSubIdFromEndpoint(endpoint) {
        var parts = endpoint.split('/');
        return parts[parts.length - 1];
    }

    function formatQuestionSnapshot(obj) {
        var questions = [];
        for (var key in obj) {
            var q = {
                key: key,
                name: obj[key].name,
                question: obj[key].question,
                computer_number: obj[key].computer_number,
                time: obj[key].time
            };
            questions.push(q);
        }
        return questions;
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
