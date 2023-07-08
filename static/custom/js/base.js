/*************************************
 * Generic functions and varaibles
**************************************/



var activeConversation = {
    id: null,
    name: null,
    phone: null,
    is_blocked: false,
    getShortName() {
        if (this.name) {
            return this.name.slice(0, 3)
        }
        return "..."
    }
};

var unread_messages = 0;

// Status Icons
const statusIcons = {
    queued: "<i class='bx bxs-traffic text-warning' title='Queued' > Queued </i>",
    failed: "<i class='bx bx-error-circle text-danger' title='Failed'> Failed </i>",
    sent: "<i class='bx bx-check-double text-info' title='Sent'> Sent </i>",
    delivered: "<i class='bx bx-message-check text-success' title='Delivered'> delivered </i>",
    undelivered: "<i class='bx bx-undo text-danger' title='Undelivered'> Undelivered </i>"
};

// Generate UUID
const generatedUUIDs = [];
function generateUUID() {
  const randomHex = () => Math.floor(Math.random() * 16).toString(16);
  const uuid = Array.from({ length: 32 }, randomHex).join('');

  if (generatedUUIDs.includes(uuid)) {
    // UUID already exists, generate a new one
    return generateUUID();
  }

  generatedUUIDs.push(uuid);
  return uuid;
}

// play sound
function playSound(audio_element) {
    audio_element[0].pause();
    audio_element[0].currentTime = 0;
    audio_element[0].play();
}

// Format Phone Number
function formatPhoneNumber(phone) {
    // Extract only numbers from the phone string
    const numbers = phone.replace(/\D/g, '');
  
    // Check the length of the extracted number
    if (numbers.length === 11) {
      return `+${numbers}`;
    } else if (numbers.length === 10) {
      return `+1${numbers}`;
    } else {
      // Handle invalid or unexpected number lengths
      return numbers;
    }
}

// format date string utc to local
function formatDateTime(dateString) {
    const date = new Date(dateString);
    dateTime = `${date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' })}`;
    return dateTime
}

function extractEmailsFromText(text) {
    var regex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    var matches = text.match(regex);
    return matches ? matches.join(' ') : null;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
    .then(function() {
        $(".copyclipboard-alert").html("Item copied!");
        $('.copyclipboard-alert').addClass('show');
        setTimeout(function() {
            $('.copyclipboard-alert').removeClass('show');
        }, 700);
    }).catch(function(error) {
        $(".copyclipboard-alert").html("Unable to copy item!");
        $('.copyclipboard-alert').addClass('show');
        setTimeout(function() {
            $('.copyclipboard-alert').removeClass('show');
        }, 700);
    });
}

// chat user responsive hide show
function toggleSelected(conversation_id="") {
    var userChatElement = document.getElementsByClassName("user-chat");

    $( `.chat-user-list li#conversation-id-${conversation_id} a` ).on( "click", function() {
        // setup name first then make blank of that componenet, set a loader. finally after rendering complete remove loader
        // let user_chat_topbar = $(".user-chat-topbar");
        // let title = user_chat_topbar.find(".avatar-title");
        let parent = $(this).parent()
        // update activateConversation
        activeConversation.id = parent.attr("data-id");
        activeConversation.name = parent.attr("data-uname")
        activeConversation.phone = parent.attr("data-phone")
        activeConversation.is_blocked = parent.attr("data-is_blocked") == 'false' ? false : true

        $(".user-chat-topbar .avatar-title .username").html(activeConversation.getShortName())
        $(".user-chat-topbar h6 a").html(activeConversation.name)
        $(".user-chat-topbar p").html(activeConversation.phone)
        
        let block_label = $("#contact_block_unblock_form label")
        activeConversation.is_blocked ? $(block_label).html("Unblock") : $(block_label).html("Block")

        $("#users-conversation").html("");

        // show chat-messages component
        $(".user-chat").addClass("user-chat-show");
        $(".user-chat").removeClass("d-none");
        $("textarea.chat-input").focus();

        // chat user list link active
        var chatUserList = document.querySelector(".chat-user-list li.active");
        if (chatUserList) chatUserList.classList.remove("active");
        this.parentNode.classList.add("active");

        get_chat_list();
    });

    document.querySelectorAll(".sort-contact ul li").forEach(function (item2) {
        item2.addEventListener("click", function (event) {
            userChatElement.forEach(function (elm) {
                elm.classList.add("user-chat-show");
            });
        });
    });
    
    // user-chat-remove
    document.querySelectorAll(".user-chat-remove").forEach(function (item) {
        item.addEventListener("click", function (event) {
            userChatElement.forEach(function (elm) {
                elm.classList.remove("user-chat-show");
            });
        });
    });
}

// Scroll to Bottom
function scrollToBottom(id) {
    var simpleBar = document
      .getElementById(id)
      .querySelector("#chat-conversation .simplebar-content-wrapper");
    var offsetHeight = document.getElementsByClassName(
      "chat-conversation-list"
    )[0]
      ? document
        .getElementById(id)
        .getElementsByClassName("chat-conversation-list")[0].scrollHeight -
      window.innerHeight +
      250
      : 0;
    if (offsetHeight)
      simpleBar.scrollTo({ top: offsetHeight, behavior: "smooth" });
}

// append contact 
function appendSingleContact(contact_id, contact_name, contact_number) {
    $(".contact-list").append(`
    <li class="active" data-name="favorite" data-id="${contact_id}" data-uname="${contact_name}" data-phone="${contact_number}"> 
        <a href="javascript: void(0);">
            <div class="d-flex align-items-center">
                <div class="chat-user-img online align-self-center me-2 ms-0">
                    <div class="avatar-xs">
                        <span class="avatar-title rounded-circle bg-primary text-white">
                            <span class="username">${contact_name.substring(0, 3)}</span>
                        </span>
                    </div>
                </div>
                <div class="overflow-hidden me-2">
                    <p class="text-truncate chat-username mb-0">${contact_name}1</p>
                    <p class="text-truncate text-muted fs-13 mb-0">${contact_number}</p>
                </div>
                <div class="ms-auto d-none 'for unread message'"><span class="badge badge-soft-danger rounded p-1 fs-10">3</span></div>
            </div>
        </a> 
    </li>
    `)
}

// make unread badge
function makeUnreadBadge() {
    $(".unread_badge").html(`${ (unread_messages > 0) ? unread_messages : ""}`)
}

// make conversation read or unread
function makeReadUnreadFlagConversation(conversation_id, is_read){
    if(is_read){
        // $(`#conversation-id-${conversation_id}`).removeClass("badge-soft-danger");
        $(`#conversation-id-${conversation_id} .unread_flag`).addClass("d-none");

    } else {
        // $(`#conversation-id-${conversation_id}`).addClass("badge-soft-danger");
        $(`#conversation-id-${conversation_id} .unread_flag`).removeClass("d-none");
    }
}

function makeLeadFlagConversation(conversation_id, is_lead){
    if(is_lead){
        $(`#conversation-id-${conversation_id} .lead_flag`).removeClass("d-none");

    } else {
        $(`#conversation-id-${conversation_id} .lead_flag`).addClass("d-none");
    }
}

function makeRepliedFlagConversation(conversation_id, is_replied){
    if(is_replied){
        $(`#conversation-id-${conversation_id} .replied_flag`).addClass("d-none");

    } else {
        $(`#conversation-id-${conversation_id} .replied_flag`).removeClass("d-none");
    }
}

function makeBlockedFlagConversation(conversation_id, is_blocked){
    if(is_blocked){
        $(`#conversation-id-${conversation_id} .blocked_flag`).removeClass("d-none");
    } else {
        $(`#conversation-id-${conversation_id} .blocked_flag`).addClass("d-none");
    }
}

// prepend single chat //should pass sid
function prependSingleChat(sender, text, dateString=null, sms_status="queued", conversation_id, js_sms_uuid="", is_sending=false, sms_sid="") {
    let dateTime;
    if(dateString){
        dateTime = formatDateTime(dateString);
    }
    messageText = text.replace(/\r?\n/g, "<br>");
    let iconSpinner = '<div class="spinner-border spinner-border-sm" role="status"></div>'
    // let iconDoubleCheck = '<span class="text-success check-message-icon"><i class="bx bx-check-double"></i></span>'

    if (sender == 'customer') {
        let copyMailButton = extractEmailsFromText(messageText) ? `<button class="btn btn-sm btn-primary text-white copy-mail" onclick="copyToClipboard('${extractEmailsFromText(messageText)}')">
                                                                        <i class="bx bx-copy text-white"></i> Copy Mails
                                                                    </button>` : ""
        $("#users-conversation").prepend(`
        <li class="chat-list left" data-conversation_id=${conversation_id} data-sms_sid="${sms_sid}">
            <div class="conversation-list">
                <div class="chat-avatar">
                    <div class="avatar-xs" style="width: 2.4rem; height: 2.4rem;">
                        <span class="avatar-title rounded-circle bg-primary text-white">
                            <span class="username">tw</span>
                        </span>
                    </div>
                </div>
                <div class="user-chat-content">
                    <div class="ctext-wrap">
                        <div class="ctext-wrap-content">
                            <p class="mb-0 ctext-content">${messageText}</p>
                        </div>
                        <div class="align-self-start message-box-drop d-flex">
                            ${copyMailButton}
                        </div>
                    </div>
                    <div class="conversation-name">
                        <small class="text-muted time">${dateTime}</small> 
                        <span class="text-success check-message-icon">
                        <i class="bx bx-check-double"></i>
                        </span>
                    </div>
                </div>
            </div>
        </li>
        `);
    } else if (sender == 'me') {
        $("#users-conversation").prepend(`
        <li class="chat-list right" data-conversation_id=${conversation_id} data-sms_sid="${sms_sid}" data-js_sms_uuid="${js_sms_uuid}">
            <div class="conversation-list">
                <div class="user-chat-content">
                    <div class="ctext-wrap">
                        <div class="ctext-wrap-content">
                            <p class="mb-0 ctext-content">${messageText}</p>
                        </div>
                        <div class="align-self-start message-box-drop d-flex">
                        </div>
                    </div>
                    <div class="conversation-name">
                        <small class="text-muted time">${dateString ? dateTime : ''}</small> 
                        <span class="sms-status-icon">
                        ${is_sending ? iconSpinner : statusIcons[sms_status]}
                        </span>
                    </div>
                </div>
            </div>
        </li>
        `);
    }
    scrollToBottom("users-chat");
}
// append single chat
function appendSingleChat(sender, text, dateString=null, sms_status="queued", conversation_id, js_sms_uuid="", is_sending=false, sms_sid="") {
    let dateTime;
    if(dateString){
        dateTime = formatDateTime(dateString);
    }
    messageText = text.replace(/\r?\n/g, "<br>");
    let iconSpinner = '<div class="spinner-border spinner-border-sm" role="status"></div>'
    // let iconDoubleCheck = '<span class="text-success check-message-icon"><i class="bx bx-check-double"></i></span>'

    if (sender == 'customer') {
        let emails = extractEmailsFromText(messageText);
        let copyMailButton = emails ? `<button class="btn btn-sm btn-primary text-white copy-mail" onclick="copyToClipboard('${emails}')">
                                                                        <i class="bx bx-copy text-white"></i> Copy Mails
                                                                    </button>` : ""
        $("#users-conversation").append(`
        <li class="chat-list left" data-conversation_id=${conversation_id} data-sms_sid="${sms_sid}">
            <div class="conversation-list">
                <div class="chat-avatar">
                    <div class="avatar-xs" style="width: 2.4rem; height: 2.4rem;">
                        <span class="avatar-title rounded-circle bg-primary text-white">
                            <span class="username">tw</span>
                        </span>
                    </div>
                </div>
                <div class="user-chat-content">
                    <div class="ctext-wrap">
                        <div class="ctext-wrap-content">
                            <p class="mb-0 ctext-content">${messageText}</p>
                        </div>
                        <div class="align-self-start message-box-drop d-flex">
                            ${copyMailButton}
                        </div>
                    </div>
                    <div class="conversation-name">
                        <small class="text-muted time">${dateTime}</small> 
                        <span class="text-success check-message-icon">
                        <i class="bx bx-check-double"></i>
                        </span>
                    </div>
                </div>
            </div>
        </li>
        `);

    } else if (sender == 'me') {
        $("#users-conversation").append(`
        <li class="chat-list right" data-conversation_id=${conversation_id} data-sms_sid="${sms_sid}" data-js_sms_uuid="${js_sms_uuid}">
            <div class="conversation-list">
                <div class="user-chat-content">
                    <div class="ctext-wrap">
                        <div class="ctext-wrap-content">
                            <p class="mb-0 ctext-content">${messageText}</p>
                        </div>
                        <div class="align-self-start message-box-drop d-flex">
                        </div>
                    </div>
                    <div class="conversation-name">
                        <small class="text-muted time">${dateString ? dateTime : ''}</small> 
                        <span class="sms-status-icon">
                        ${is_sending ? iconSpinner : statusIcons[sms_status]}
                        </span>
                    </div>
                </div>
            </div>
        </li>
        `);
    }
    scrollToBottom("users-chat");
}

function prependSingleConversation(conversation_id, contact_name, contact_phone, last_message, is_read, is_lead, is_replied, is_blocked=false){
    if ( $(`#usersList li#conversation-id-${conversation_id}`).length ){
        $(`#usersList li#conversation-id-${conversation_id}`).remove();
    }
    $("#usersList").prepend(`
        <li id="conversation-id-${conversation_id}" class=""
        data-name="favorite" data-id=${conversation_id} data-uname="${contact_name}" data-phone="${contact_phone}"
        data-is_blocked="${is_blocked}"> 
            <a href="javascript: void(0);">
                <div class="d-flex align-items-center">
                    <div class="chat-user-img online align-self-center me-2 ms-0">
                        <div class="avatar-xs">
                            <span class="avatar-title rounded-circle bg-primary text-white">
                                <span class="username">${contact_name.substring(0, 3)}</span>
                            </span>
                        </div>
                    </div>
                    <div class="overflow-hidden me-2">
                        <p class="text-truncate chat-username mb-0">${contact_name}</p>
                        <p class="text-truncate last-message text-muted fs-13 mb-0">${last_message ? last_message.substring(0, 20): ""}...</p>
                    </div>
                    <div class="ms-auto">
                        <i class='blocked_flag d-none bx bx-block text-danger'></i>
                        <i class='replied_flag d-none bx bxs-message-rounded-x text-danger'></i>
                        <i class='lead_flag d-none bx bxs-envelope text-primary'></i>
                        <i class='unread_flag d-none bx bxs-circle text-primary fs-10'></i>
                    </div>
                </div>
            </a> 
        </li>
    `)
    makeReadUnreadFlagConversation(conversation_id=conversation_id, is_read=is_read);
    makeLeadFlagConversation(conversation_id=conversation_id, is_lead=is_lead)
    makeRepliedFlagConversation(conversation_id=conversation_id, is_replied=is_replied)
    makeBlockedFlagConversation(conversation_id=conversation_id, is_blocked=is_blocked)
    toggleSelected(conversation_id=conversation_id);
}

function appendSingleConversation(conversation_id, contact_name, contact_phone, last_message, is_read, is_lead, is_replied, is_blocked=false){
    $("#usersList").append(`
        <li id="conversation-id-${conversation_id}" class=""
        data-name="favorite" data-id=${conversation_id} data-uname="${contact_name}" data-phone="${contact_phone}"
        data-is_blocked="${is_blocked}"> 
            <a href="javascript: void(0);">
                <div class="d-flex align-items-center">
                    <div class="chat-user-img online align-self-center me-2 ms-0">
                        <div class="avatar-xs">
                            <span class="avatar-title rounded-circle bg-primary text-white">
                                <span class="username">${contact_name.substring(0, 3)}</span>
                            </span>
                        </div>
                    </div>
                    <div class="overflow-hidden me-2">
                        <p class="text-truncate chat-username mb-0">${contact_name}</p>
                        <p class="text-truncate last-message text-muted fs-13 mb-0">${last_message ? last_message.substring(0, 20): ""}...</p>
                    </div>
                    <div class="ms-auto">
                        <i class='blocked_flag d-none bx bx-block text-danger'></i>
                        <i class='replied_flag d-none bx bxs-message-rounded-x text-danger'></i>
                        <i class='lead_flag d-none bx bxs-envelope text-primary'></i>
                        <i class='unread_flag d-none bx bxs-circle text-primary fs-10'></i>
                    </div>
                    
                </div>
            </a> 
        </li>
    `)
    makeReadUnreadFlagConversation(conversation_id=conversation_id, is_read=is_read);
    makeLeadFlagConversation(conversation_id=conversation_id, is_lead=is_lead)
    makeRepliedFlagConversation(conversation_id=conversation_id, is_replied=is_replied)
    makeBlockedFlagConversation(conversation_id=conversation_id, is_blocked=is_blocked)
    toggleSelected(conversation_id=conversation_id);
}

// // updating chat messages
// function updateSelectedChat() {
//     document.getElementById("users-chat").style.display = "block";
//     getChatMessages(url + "chats.json");
// }




/*************************************
 * API requests
**************************************/

// Contact List
function get_contact_list(page = 1) {
    $(".contact-list").html(`
        <div class="d-flex my-5 justify-content-center">
            <div class="spinner-grow spinner-grow-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="spinner-grow spinner-grow-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="spinner-grow spinner-grow-sm" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `)
    
    $.ajax({
        url: `${contact_url}?page=${page}`,  // Replace with the actual URL for fetching the contact list
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            // Handle the successful response
            if (response.status === 200) {
                $(".total-contacts").html(`(${response.data.pagination.count})`)
                // parase list item with nested parse
                let contacts = response.data.results.map(item => {
                    const parsedItem = JSON.parse(item);
                    parsedItem.twilio_account = JSON.parse(parsedItem.twilio_account);
                    return parsedItem;
                });
                $(".contact-list").html("")
                if (contacts){
                    // let conversations = JSON.parse(response.data.results) // single item
                    for (i = 0; i < contacts.length; i++) {
                        appendSingleContact(contact_id=contacts[i].id, contact_name=contacts[i].name, contact_number=contacts[i].phone)
                    }
                } else {
                    $(".contact-list").html(`
                        <div class="d-flex my-5 justify-content-center">
                            <div class="text-muted">No Contacts</div>
                        </div>
                    `)
                }
            }

        },
        error: function (xhr, textStatus, errorThrown) {
            // Handle the error
            console.log(xhr.responseText);
        }
    });
}

$( "#pills-contacts-tab" ).on( "click", function( event ) {
    get_contact_list(page=1)
});
// Contact Update

// Contact Delete

// Conversation List (users list)
function get_conversation_list(page = 1) {
    if (page === 1){
        $("#usersList").html(`
            <div class="d-flex my-5 justify-content-center">
                <div class="spinner-grow spinner-grow-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="spinner-grow spinner-grow-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="spinner-grow spinner-grow-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `)
    } else {
        $("#usersList").append(`
            <div class="d-flex my-5 justify-content-center conversation_loader">
                <div class="spinner-grow spinner-grow-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="spinner-grow spinner-grow-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="spinner-grow spinner-grow-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `)
    }
    
    $.ajax({
        url: `${conversation_url}?page=${page}`,  // Replace with the actual URL for fetching the contact list
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            // Handle the successful response
            if (response.status === 200) {
                // let conversations = response.data.results.map(item => JSON.parse(item)); // list item
                $(".total-message").html(`(${response.data.pagination.count})`)
                // $(".unread_messages").html(`${response.data.unread_messages}`);
                unread_messages = response.data.unread_messages;
                makeUnreadBadge();

                // parase list item with nested parse
                let conversations = response.data.results.map(item => {
                    const parsedItem = JSON.parse(item);
                    parsedItem.twilio_account = JSON.parse(parsedItem.twilio_account);
                    parsedItem.contact = JSON.parse(parsedItem.contact);
                    return parsedItem;
                });
                let pagination = response.data.pagination
                // console.log(pagination)
                if (pagination.page_number === 1){
                    $("#usersList").html("")
                } else {
                    $("#usersList .conversation_loader").remove();
                }
                if (conversations){
                    // let conversations = JSON.parse(response.data.results) // single item
                    for (i = 0; i < conversations.length; i++) {
                        appendSingleConversation(conversation_id=conversations[i].id, contact_name=conversations[i].contact.name, 
                            contact_phone=conversations[i].contact.phone, last_message=conversations[i].last_message, 
                            is_read=conversations[i].is_read, is_lead=conversations[i].is_lead, is_replied=conversations[i].is_replied,
                            is_blocked=conversations[i].contact.is_blocked
                        )
                    }
                } else {
                    $("#usersList").html(`
                        <div class="d-flex my-5 justify-content-center">
                            <div class="text-muted">No Conversations</div>
                        </div>
                    `)
                }
                
                if (pagination.next){
                    $("button.more_conversations_btn").attr("data-next_page", `${pagination.next}`).removeClass("d-none");
                } else {
                    $("button.more_conversations_btn").addClass("d-none");
                }
                
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            // Handle the error
            console.log(xhr.responseText);
        }
    });
}

$("button.more_conversations_btn").on("click", function(event) {
    let page = parseInt($(this).attr("data-next_page"))
    get_conversation_list(page=page)
});

$( "#pills-chat-tab" ).on( "click", function( event ) {
    get_conversation_list(page=1)
});

// Conversation Mark as Read unread
function mark_as_read_unread(url, csrfmiddlewaretoken, conversation_id, is_read) {
    let prev_html = $("#mark_as_read_unread_form button").html()
    $("#mark_as_read_unread_form button").html(`<div class="spinner-grow" role="status">
                                                </div>`)
    $.ajax({
        url: url,  
        type: 'POST',
        dataType: 'json',
        data: {
            csrfmiddlewaretoken: csrfmiddlewaretoken,
            conversation_id: conversation_id,
            is_read: is_read
        },
        success: function (response) {
            // Handle the successful response
            if (response.status === 200) {
                let conversation = JSON.parse(response.data.results);
                $(`#usersList li#conversation-id-${conversation.id} .unread_flag`).addClass("d-none");
                $("#mark_as_read_unread_form button").html(prev_html);
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            // Handle the error
            console.log(xhr.responseText);
        }
    });
}

$( "#mark_as_read_unread_form" ).on( "submit", function( event ) {
    event.preventDefault();
    let csrfmiddlewaretoken = $(this).find("[name='csrfmiddlewaretoken']").val()
    let url = $(this).attr("action");
    mark_as_read_unread(url, csrfmiddlewaretoken, activeConversation.id, is_read=true);
});


// Contact Block or Unblock
function contact_block_unblock(url, csrfmiddlewaretoken, conversation_id, contact_phone, is_blocked) {

    let prev_html = $("#contact_block_unblock_form button").html()
    $("#contact_block_unblock_form button").html(`<div class="spinner-grow" role="status">
                                                </div>`)
    $.ajax({
        url: url,  
        type: 'post',
        dataType: 'json',
        data: {
            csrfmiddlewaretoken: csrfmiddlewaretoken,
            contact_phone: contact_phone,
            is_blocked: is_blocked
        },
        success: function (response) {
            // Handle the successful response
            if (response.status === 200) {
                is_blocked ? $(`#usersList li#conversation-id-${conversation_id} .blocked_flag`).removeClass("d-none") : $(`#usersList li#conversation-id-${conversation_id} .blocked_flag`).addClass("d-none")
                $("#contact_block_unblock_form button").html(prev_html);
                if(activeConversation.id == conversation_id) {
                    $("#contact_block_unblock_form label").html(`${is_blocked ? 'Unblock' : 'Block'}`)
                    activeConversation.is_blocked = is_blocked;
                }
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            // Handle the error
            console.log(xhr.responseText);
        }
    });
}

$( "#contact_block_unblock_form" ).on( "submit", function( event ) {
    event.preventDefault();
    let csrfmiddlewaretoken = $(this).find("[name='csrfmiddlewaretoken']").val()
    let url = $(this).attr("action");
    contact_block_unblock(url, csrfmiddlewaretoken, activeConversation.id, activeConversation.phone, is_blocked = !activeConversation.is_blocked);
});


// Conversation Delete

// Chat List/history (chat history with 1 user)
function get_chat_list(page = 1) {
    $("#users-conversation").html(`
    <div class="d-flex my-5 justify-content-center">
        <div class="spinner-grow spinner-grow-sm" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <div class="spinner-grow spinner-grow-sm" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <div class="spinner-grow spinner-grow-sm" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
    `)
    if (activeConversation.id){
        $.ajax({
            url: `${chat_url}?page=${page}`, 
            type: 'GET',
            dataType: 'json',
            data: {
                conversation_id: parseInt(activeConversation.id),
            },
            success: function (response) {
                // Handle the successful response
                if (response.status === 200) {
                    // parase list item with nested parse
                    let messages = response.data.results.map(item => {
                        const parsedItem = JSON.parse(item);
                        // parsedItem.twilio_account = JSON.parse(parsedItem.twilio_account);
                        // parsedItem.contact = JSON.parse(parsedItem.contact);
                        return parsedItem;
                    });
                    // ${messages[i].contact.name.substring(0, 3)}
                    // let conversations = JSON.parse(response.data.results) // single item
                    $("#users-conversation").html("")
                    if (messages){
                        for (i = 0; i < messages.length; i++) {
                            prependSingleChat(sender=messages[i].sender, text=messages[i].text, dateString=messages[i].updated_at, 
                                sms_status=messages[i].status, conversation_id=activeConversation.id, js_sms_uuid="", is_sending=false, sms_sid=messages[i].sms_sid);
                            // scrollToBottom("users-chat");
                        }
                    } else {
                        $("#users-conversation").html(`
                            <div class="d-flex my-5 justify-content-center">
                                <div class="text-muted">No Messages</div>
                            </div>
                        `)
                    }
                    
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                // Handle the error
                console.log(xhr.responseText);
            }
        });
    }
}

// Send Message
function send_message(csrfmiddlewaretoken, text, url, conversation_id, js_sms_uuid="") {
    $.ajax({
        url: url,  // Replace with the actual URL for fetching the contact list
        type: 'POST',
        dataType: 'json',
        data: {
            csrfmiddlewaretoken: csrfmiddlewaretoken,
            text: text,
            conversation_id: conversation_id
        },
        success: function (response) {
            // Handle the successful response
            if (response.status === 200) {
                // console.log("Message Created!")
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            // Handle the error
            console.log(xhr.responseText);
        }
    });
}

$( "#chatinput-form" ).on( "submit", function( event ) {
    event.preventDefault();
    let chatForm = $("#chatinput-form");
    let csrfmiddlewaretoken = $(chatForm).find("[name='csrfmiddlewaretoken']").val()
    let text = $(chatForm).find("[name='text']").val()
    let url = $(chatForm).attr("action");
    let js_sms_uuid = generateUUID();
    // appendSingleChat(sender = 'me', text=text, dateString=null, sms_status="", conversation_id = activeConversation.id , js_sms_uuid=js_sms_uuid, is_sending=true)
    send_message(csrfmiddlewaretoken, text, url, activeConversation.id, js_sms_uuid);
    $(chatForm).find("[name='text']").val("")
});

// Chat Delete

// Twilio Account List

// Twilio Account update

// Twilio Account Delete

// PhoneNumber List

// PhoneNumber Update

// PhoneNumber Delete

// Misc
// Contact, conversation and messages

function get_or_create_contact_conversation_message(url, csrfmiddlewaretoken, phone) {
    formated_phone = formatPhoneNumber(phone)
    if (formated_phone.length !== 12) {
        return;
    }
    $.ajax({
        url: url,  // Replace with the actual URL for fetching the contact list
        type: 'POST',
        dataType: 'json',
        data: {
            csrfmiddlewaretoken: csrfmiddlewaretoken,
            phone: formated_phone
        },
        success: function (response) {
            // Handle the successful response
            if (response.status === 200) {
                let conversation = JSON.parse(response.data.results);
                conversation.twilio_account = JSON.parse(conversation.twilio_account);
                conversation.contact = JSON.parse(conversation.contact);
                prependSingleConversation(conversation_id=conversation.id, contact_name=conversation.contact.name, 
                    contact_phone=conversation.contact.phone, last_message=conversation.last_message, 
                    is_read=conversation.is_read, is_lead=conversation.is_lead, is_replied=conversation.is_replied,
                    is_blocked=conversation.contact.is_blocked)
                $(".contactModal").modal("hide");
                $(`#usersList li#conversation-id-${conversation.id} a`).trigger('click');
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            // Handle the error
            console.log(xhr.responseText);
        }
    });
}

$( "#contactConversationForm" ).on( "submit", function( event ) {
    event.preventDefault();
    let chatForm = $("#contactConversationForm");
    let csrfmiddlewaretoken = $(chatForm).find("[name='csrfmiddlewaretoken']").val()
    let phone = $(chatForm).find("[name='phone']").val()
    let url = $(chatForm).attr("action");
    get_or_create_contact_conversation_message(url=url, csrfmiddlewaretoken=csrfmiddlewaretoken, phone=phone)
    $(chatForm).find("[name='phone']").val("")
});


// Other settings
if (localStorage.getItem('got_a_lead') == null){
    localStorage.setItem('got_a_lead', 'true')
    $("#got_a_lead_input").prop('checked', true);
}
if (localStorage.getItem('message_received') == null){
    localStorage.setItem('message_received', 'true')
    $("#message_received_input").prop('checked', true);

}
if (localStorage.getItem('message_delivered') == null){
    localStorage.setItem('message_delivered', 'true')
    $("#message_delivered_input").prop('checked', true);

}
if (localStorage.getItem('got_a_lead') == 'false') {
    $("#got_a_lead_input").prop('checked', false);
}
if (localStorage.getItem('message_received') == 'false') {
    $("#message_received_input").prop('checked', false);
}
if (localStorage.getItem('message_delivered') == 'false') {
    $("#message_delivered_input").prop('checked', false);
}

$("#got_a_lead_input").on("change", function(event) {
    let checked = $(this).is(':checked')
    localStorage.setItem('got_a_lead', `${checked}`)
    $(this).prop('checked', checked)
})
$("#message_received_input").on("change", function(event) {
    let checked = $(this).is(':checked')
    localStorage.setItem('message_received', `${checked}`)
    $(this).prop('checked', checked)
})
$("#message_delivered_input").on("change", function(event) {
    let checked = $(this).is(':checked')
    localStorage.setItem('message_delivered', `${checked}`)
    $(this).prop('checked', checked)
})

// setup focus
$('.contactModal').on('shown.bs.modal', function () {
    $('#addcontactphone-input').focus();
    // $('[data-bs-target=".contactModal"]').blur();
});
$('.contactModal').on('hidden.bs.modal', function () {
    // $('#addcontactphone-input').blur();
    // $('[data-bs-target=".contactModal"]').blur();
    $("textarea.chat-input").focus();
    // $(document).on('keyup', function(event) {
    //     if (event.key === ' ' || event.key === 'Enter') {
    //       event.stopPropagation();
    //     }
    // });
    // $(document).on('keydown', function(event) {
    //     if (event.key === ' ' || event.key === 'Enter') {
    //       event.preventDefault();
    //     }
    // });
});

// WebSocket

const socket = new WebSocket(
    'wss://'
    + window.location.host
    + '/ws/chat/user_'
    + userId
    + '/'
);

// Listen for WebSocket messages
socket.onmessage = function(event) {
    let message = JSON.parse(event.data);
    data = message.message
    data.results = JSON.parse(message.message.results);
    data.results.conversation = JSON.parse(data.results.conversation);
    data.results.conversation.contact = JSON.parse(data.results.conversation.contact)
    // conversation prepend it.
    let conversation = data.results.conversation

    prependSingleConversation(
        conversation_id=conversation.id, contact_name=conversation.contact.name, 
        contact_phone=conversation.contact.phone, last_message=conversation.last_message,
        is_read=conversation.is_read, is_lead=conversation.is_lead, is_replied=conversation.is_replied,
        is_blocked=conversation.contact.is_blocked
    )

    if (data.type === "sent_sms_status" && parseInt(activeConversation.id) === parseInt(data.results.conversation.id)) {
        if (data.results.status == "queued"){
            // append
            appendSingleChat(sender='me', text=data.results.text, dateString=data.results.updated_at, sms_status=data.results.status,
            conversation_id=data.results.conversation.id, js_sms_uuid=null, is_sending=false, sms_sid=data.results.sms_sid)
        } else {
            if (data.results.status == "delivered"){
                let audio_element = $("#sound_message_delivered");
                if (localStorage.getItem('message_delivered')==='true'){
                    playSound(audio_element=audio_element);
                }
            }
            $(`li.chat-list.right[data-sms_sid='${data.results.sms_sid}'] .sms-status-icon`).html(`${statusIcons[data.results.status]}`)
        }
        
    } else if (data.type === "receive_sms") {
        // play notification sound
        let emails = extractEmailsFromText(data.results.text);
        if (localStorage.getItem('got_a_lead')==='true' && emails){
            let audio_element = $("#sound_got_a_lead");
            playSound(audio_element=audio_element);
        } else if (localStorage.getItem('message_received')==='true') {
            let audio_element = $("#sound_message_received");
            playSound(audio_element=audio_element);
        }
        // console.log(data.results)
        // if active conversation append chat
        if (parseInt(activeConversation.id) === parseInt(data.results.conversation.id)) {
            appendSingleChat(sender='customer', text=data.results.text, dateString=data.results.updated_at, sms_status=data.results.status,
            conversation_id=data.results.conversation.id, js_sms_uuid=null, is_sending=false, sms_sid=data.results.sms_sid)
        }
    }

};

socket.onopen = function(e) {
    console.log("Connected!");
}
socket.onclose = function(e) {
    console.log("Disconnected!");
}
socket.onerror = function(e) {
    console.log("error!")
    console.log(e)
}



$(function(){
    get_conversation_list()

    // $('button[data-bs-target=".contactModal"]').on('click', function() {
    //     $(this).blur();
    // });
    $('button[data-bs-target=".contactModal"]').on('keyup', function(event) {
        if (event.key === ' ' || event.key === 'Enter') {
          event.stopPropagation();
        }
    });
    $('button[data-bs-target=".contactModal"]').on('keydown', function(event) {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
        }
    });

    $('textarea.chat-input').on('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            $(this).closest('form').submit();
        } else if (event.key === 'Enter' && event.shiftKey) {
            var currentCursorPosition = this.selectionStart;
            var textareaValue = $(this).val();
            var newValue = textareaValue.substring(0, currentCursorPosition) + '\n' + textareaValue.substring(currentCursorPosition);
            $(this).val(newValue);
            this.selectionStart = currentCursorPosition + 1;
            this.selectionEnd = currentCursorPosition + 1;
            event.preventDefault();
        }
    });
});
