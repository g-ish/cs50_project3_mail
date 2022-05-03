document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

}


///////////////////////////////////////////////////////////////////
/////////////////////////// new code //////////////////////////////
///////////////////////////////////////////////////////////////////

function get_all_emails(mailbox) {
  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {

      let emailContainer = document.createElement('div'); 
      let emailSender = document.createElement('p');
      let emailSubject = document.createElement('p');
      let emailBody = document.createElement('p');
      let emailRecipients = document.createElement('p');

      emailSender.innerHTML = "From: " + email['sender'];
      emailRecipients.innerHTML = "To: " + email['recipients']; 
      emailSubject.innerHTML = "Subject: " + email['subject'];
      emailBody.innerHTML = "Message: " + email['body'];

      emailContainer.appendChild(emailSender)
      emailContainer.appendChild(emailRecipients)
      emailContainer.appendChild(emailSubject)
      emailContainer.appendChild(emailBody)

      // emailContainer.innerHTML = emailSubject

      document.getElementById('emails-view').appendChild(emailContainer)
      console.log(email)
    })

    // do something else 
  })
}

window.onload = function() {
  var form = document.querySelector("form");
  form.onsubmit = submitted.bind(form);
}

function submitted(event) {
  recipients = document.getElementById('compose-recipients').value; 
  subject = document.getElementById('compose-subject').value; 
  body = document.getElementById('compose-body').value; 
  
  send_mail(recipients, subject, body);
  event.preventDefault();
}

function send_mail(recipients, subject, body) {
  console.log('sending mail...')
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({ 
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result); 
  })
}


// Action should be; archived, read etc. actionBool either true or false. 
function get_email(emailID, action, actionBool) {
  if (action != 'archived' | 'read') {
    console.log('invalid action')
  }


fetch('/emails/' + emailID, {
  method: 'PUT',
  body: JSON.stringify({
      archived: true
  })
})
}