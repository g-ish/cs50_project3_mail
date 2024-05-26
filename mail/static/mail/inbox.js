document.addEventListener('DOMContentLoaded', function () {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', () => compose_email());

    document.querySelector('#compose-form').addEventListener('submit', send_mail);
    // By default, load the inbox
    load_mailbox('inbox');

});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#view-email').style.display = 'none';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';


}

function load_mailbox(mailbox) {
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#view-email').style.display = 'none';

    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    console.log('Loading mailbox: ' + mailbox)
    fetch('emails/' + mailbox)

        .then(response => response.json())
        .then(emails => {
                if (emails.length == 0) {
                    let emailSummary = document.createElement('div')
                    emailSummary.innerHTML = "No emails!"
                } else {
                    for (let i = 0; i < emails.length; i++) {
                        let emailAddress = document.createElement('div')
                        if (mailbox === "sent") {
                            emailAddress.setAttribute('id', 'sender-inbox')
                            let addresses = emails[i]['recipients']
                            let show_addresses = ''

                            for (let addressCount = 0; addressCount < addresses.length; addressCount++) {
                                if (addressCount == 0) {
                                    show_addresses = "<b>" + addresses[addressCount] + "</b>"
                                } else {
                                    show_addresses = show_addresses + ', ' + addresses[addressCount]
                                    // Only show the first 3 addresses, compact the remainder
                                    if (addressCount == 2) {
                                        show_addresses = show_addresses + ', + ' + String(addresses.length - addressCount - 1) + ' addresses.'
                                        break;
                                    }
                                }
                            }
                            show_addresses.trim()
                            emailAddress.innerHTML = show_addresses

                        } else {
                            emailAddress.setAttribute('id', "sender-inbox")
                            emailAddress.innerHTML = emails[i]['sender']
                        }

                        let emailSummary = document.createElement('div')
                        emailSummary.setAttribute('id', 'email-summary-inbox')

                        let subject = document.createElement('div')
                        subject.setAttribute('id', 'subject-inbox')
                        subject.innerHTML = emails[i]['subject']

                        // let emailBody = document.createElement('div')
                        // emailBody.setAttribute("id", "body-summary-inbox")
                        // email_Content = emails[i]['body'].substring(0, 45) + '...'
                        // emailBody.innerHTML = email_Content

                        emailSummary.appendChild(subject)
                        // emailSummary.appendChild(emailBody)

                        let timestamp = document.createElement('div')
                        timestamp.setAttribute('id', 'timestamp-inbox')
                        timestamp.innerHTML = emails[i]['timestamp']

                        let anEmail = document.createElement('div')
                        anEmail.setAttribute('href', "#")
                        anEmail.setAttribute('id', 'single-email')

                        anEmail.appendChild(emailAddress)
                        anEmail.appendChild(emailSummary)
                        anEmail.appendChild(timestamp)
                        anEmail.addEventListener('click', () => view_email(emails[i]['id']))


                        if (emails[i]['read'] == false && mailbox == 'inbox') {
                            anEmail.style.backgroundColor = "rgb(140,146,172)"
                        } else {

                            anEmail.style.backgroundColor = "rgb(255,255,255)"
                        }
                        document.querySelector('#emails-view').appendChild(anEmail)
                    }
                }
            }
        )
    ;
        }

    function send_mail(event) {
        event.preventDefault() // https://developer.mozilla.org/en-US/docs/web/api/event/preventdefault
        let recipients = document.querySelector("#compose-recipients").value;
        let subject = document.querySelector("#compose-subject").value;
        let body = document.querySelector("#compose-body").value;

        const data = {
            "recipients": recipients,
            "subject": subject,
            "body": body
        }

        console.log(data)
        fetch('emails', {
            method: 'POST',
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                if (result['error']) {
                    alert(JSON.stringify(result['error']));
                } else {
                    console.log('email sent successfully')
                    load_mailbox('sent')
                }
            })

    }

    function view_email(id) {
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'none';
        document.querySelector('#view-email').style.display = 'block';


        let viewEmailObj = document.querySelector('#view-email');
        viewEmailObj.innerHTML = '' // reset any divs created by a different email


        let interactionsHeader = document.createElement('div')
        interactionsHeader.setAttribute('id', "email-interactions-header")


        fetch('emails/' + id)
            .then(response => response.json())
            .then(email => {

                if (email['archived'] != true) {
                    let replyButton = document.createElement('button')
                    replyButton.setAttribute('class', 'btn btn-success')
                    replyButton.setAttribute('id', 'reply-all')
                    replyButton.innerHTML = 'Reply all'


                    let unreadButton = document.createElement('button')
                    unreadButton.setAttribute('class', 'btn btn-warning')
                    unreadButton.setAttribute('id', 'mark-unread')
                    unreadButton.innerHTML = 'Mark as unread'


                    let archiveButton = document.createElement('button')
                    archiveButton.setAttribute('class', 'btn btn-danger')
                    archiveButton.setAttribute('id', 'mark-archive')
                    archiveButton.innerHTML = 'Send to Archive'


                    archiveButton.addEventListener('click', function () {
                        email_action(id, action = "archive")
                    })
                    unreadButton.addEventListener('click', function () {
                        email_action(id, action = "unread")
                    })
                    replyButton.addEventListener('click', function () {
                        reply_all(id, email)
                    })

                    interactionsHeader.append(replyButton, unreadButton, archiveButton)
                } else {

                    let archiveButton = document.createElement('button')
                    archiveButton.setAttribute('class', 'btn btn-danger')
                    archiveButton.setAttribute('id', 'mark-archive')
                    archiveButton.innerHTML = 'Unarchive'

                    archiveButton.addEventListener('click', function () {
                        email_action(id, action = "unarchive")
                    })
                    interactionsHeader.append(archiveButton)
                }


                let subject = document.createElement('div')
                subject.setAttribute('id', 'subject')
                subject.innerHTML = '<b>Subject: </b>' + email['subject']


                let addressinfo = document.createElement('div')
                let senderInfo = document.createElement('div')
                let recipientInfo = document.createElement('div')


                senderInfo.setAttribute('id', "sender")
                senderInfo.innerHTML = '<b>From: </b>' + email['sender']

                recipientInfo.setAttribute('id', "recipients")
                // recipientInfo.innerHTML = 'To : ' + email['recipients'].toString().replace(",",", ")
                recipientInfo.innerHTML = '<b>To: </b>' + email['recipients'].join(', ')
                addressinfo.append(senderInfo, recipientInfo)

                let tStamp = document.createElement('div')
                tStamp.setAttribute('id', 'tStamp')
                tStamp.innerHTML = '<b>Timestamp: </b>' + email['timestamp']

                let emailBody = document.createElement('div')
                emailBody.setAttribute('id', 'email-body')


                let body = ''
                body = email['body'].replace(/\r\n|\r|\n/g, '<br>') // replace JS new lines with HTML type new lines
                emailBody.innerHTML = body
                viewEmailObj.append(interactionsHeader, subject, addressinfo, tStamp, emailBody)

                fetch('/emails/' + id, {
                    method: 'PUT',
                    body: JSON.stringify({
                        read: true
                    })
                })
            });
    }

    function reply_all(id, email) {
        // Show compose view and hide other views

        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'block';
        document.querySelector('#view-email').style.display = 'none';

        // document.querySelector('#compose-recipients').value = email['recipients'].replace(",", ", ")
        document.querySelector('#compose-recipients').value = email['recipients'].join(", ")

        if (email['subject'].includes('RE: ')) {
            document.querySelector('#compose-subject').value = email['subject']
        } else {
            document.querySelector('#compose-subject').value = 'RE: ' + email['subject']
        }

        var textBody = '\n On ' + email['timestamp'] + ' ' + email['sender'] + ' wrote: \n' + email['body']

        document.querySelector('#compose-body').value = textBody
        document.getElementById("compose-body").setSelectionRange(0, 0)
        document.getElementById("compose-body").focus()
    }

    function email_action(id, action) {

        if (action === 'unread') {
            fetch('/emails/' + id, {
                method: 'PUT',
                body: JSON.stringify({
                    read: false
                })
            })
                .then(response => {
                    console.log(response)
                    load_mailbox('inbox')
                })

        } else if (action === 'archive') {
            fetch('/emails/' + id, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: true
                })
            })
                .then(response => {
                    console.log(response)
                    load_mailbox('archive')
                })

        } else if (action === 'unarchive') {
            fetch('/emails/' + id, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: false
                })
            })
                .then(response => {
                    console.log(response)
                    load_mailbox('inbox')
                })
        }
        // } else if (action === 'reply-all') {
        //     console.log('replying  all')
        //
        // } else {
        //     console.log('unknown action: ' + action)
        // }


    }
