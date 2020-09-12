InboxSDK.load('1', 'sdk_rupaparapankaj_32b6a78c77').then(function (sdk) {
    $(".AO").parent().append("<div class='AO-widgets'>Welcome..</div>");
    $("body").prepend(`<a id='btn-start-stop' class='btn-stop T-I J-J5-Ji ar7 nf T-I-ax7 L3'>Start</a>
        <a id='btn-cmd' class ='T-I J-J5-Ji ar7 nf T-I-ax7 L3'>Welcome</a>
        `);
    var IsRuning = false;
    $('#btn-start-stop').click(function () {
        if (IsRuning == false) {
            IsRuning = true;
            $('#btn-start-stop').text("Starting...");
            artyomMain.initialize(mainConfig).then(function () {
                setTimeout(function () {
                    $('#btn-cmd').show(100).text("Command Mode");
                    $('#btn-start-stop').text("Stop").toggleClass('btn-stop').toggleClass('btn-start');
                }, 3000);
            });
        } else {
            IsRuning = false;
            $('#btn-start-stop').text("Start").toggleClass('btn-stop').toggleClass('btn-start');
            if (artyomWritten.isRecognizing()) {
                SwitchModeW_to_C();
            }
            if (artyomMain.isRecognizing()) {
                artyomMain.fatality();
                $('#btn-cmd').hide(100);
            }
        }
    });

    chrome.extension.sendRequest({ cmd: "bg_read_file" }, function (html) {
        $(".AO-widgets").html(html);
    });

    var Icons = {
        voice_back: chrome.extension.getURL('icons/mic-normal.svg'),
        voice_active: chrome.extension.getURL('icons/mic-normal-active.svg'),
    };

    var artyomMain = new Artyom();
    var artyomWritten = new Artyom();
    var mainConfig = {
        lang: "en-US",
        continuous: true,
        debug: false,
        listen: true
    };
    var mainWritten = {
        lang: "en-US",
        continuous: true,
        debug: false,
        listen: true,
    };
    var commandMainList = [
    {
        CMD: 'New email',
        indexes: ["new email", "new mail", "compose", "compose email", "compose mail"],
        action: function (i) {
            OkayResponse(this.CMD);
            sdk.Compose.openNewComposeView();
        }
    },
    {
        CMD: 'Maximize',
        indexes: ["full screen", "maximize"],
        action: function (i) {
            OkayResponse(this.CMD);
            sdk.Compose.registerComposeViewHandler(function (composeView) {
                composeView.setFullscreen();
            });
        }
    },
    {
        CMD: 'Minimize',
        indexes: ["minimize"],
        action: function (i) {
            OkayResponse(this.CMD);
            sdk.Compose.registerComposeViewHandler(function (composeView) {
                composeView.setMinimized();
            });
        }
    },
{
    CMD: 'Switch Mode',
    indexes: ["switch mode"],
    action: function (i) {
        SwitchModeC_to_W();
    }
}];

    var commandWrittenList = [
    {
        indexes: ["a"],
        action: function (i) {

        }
    },
    {
        CMD: 'Switch Mode',
        indexes: ["switch mode"],
        action: function (i) {
            SwitchModeW_to_C();
        }
    }];

    var commandTemplate = [
        '<CMD>',
        'go to <CMD>',
        'go to <CMD> mail',
        'go to <CMD> email',
        //"go to <CMD> box",
        //"go to <CMD> folder",
        'show me <CMD>',
        //'show me <CMD> mail',
        //'show me <CMD> email',
        //"show me <CMD> box",
        //"show me <CMD> folder"
    ];
    var data = [
            { index: 0, keyWord: ['inbox'], actionKeyWord: 'inbox' },
        { index: 1, keyWord: ['all'], actionKeyWord: 'all' },
        { index: 2, keyWord: ['sent'], actionKeyWord: 'sent' },
        { index: 3, keyWord: ['starred'], actionKeyWord: 'starred' },
        { index: 4, keyWord: ['draft'], actionKeyWord: 'drafts' },
        { index: 5, keyWord: ['trash'], actionKeyWord: 'trash' },
        { index: 6, keyWord: ['spam', 'junk'], actionKeyWord: 'spam' },
 { index: 7, keyWord: ['imp', 'important'], actionKeyWord: 'imp' },
 { index: 8, keyWord: ['chats'], actionKeyWord: 'chats' }
    ];

    $.each(data, function (i, item) {
        var command = {
            CMD: 'Open ' + item.actionKeyWord + ' email',
            indexes: [],
            action: function (i) {
                OkayResponse(this.CMD);
                sdk.Router.goto(item.actionKeyWord);
            }
        };
        $.each(commandTemplate, function (i, subItem) {
            if (subItem) {
                $.each(item.keyWord, function (i, subItem1) {
                    var cmd = subItem.replace(/<CMD>/gi, subItem1);
                    command.indexes.push(cmd);
                });
            }
        });
        commandMainList.push(command);
    });

    //$.each(commandMainList, function (i, item) {
    //    console.log("<td>" + item.indexes.join("<b> / </b>") + "</td>");
    //});

    artyomMain.addCommands(commandMainList);
    artyomWritten.addCommands(commandWrittenList);

    sdk.Compose.registerComposeViewHandler(function (composeView) {
        composeView.addButton({
            title: "Start email writting  mode",
            iconUrl: Icons.voice_back,
            iconClass: 'btn-voice',
            onClick: function (btnevent) {
                SwitchModeC_to_W();
            },
        });
        composeView.on('destroy', function (event) {
            SwitchModeW_to_C();
        });
    });


    function SwitchModeC_to_W() {
        if (artyomWritten.isRecognizing()) {
            SwitchModeW_to_C();
        } else {
            if (artyomMain.isRecognizing()) {
                ActiveWritingbutton();
                artyomMain.fatality().then(function () {
                    artyomWritten.initialize(mainWritten).then(function () {
                        IsRuning = true;
                        $('#btn-cmd').show(100).text('Writing Mode');
                    });
                });
            } else {
                $('#btn-start-stop').text("Starting...");
                artyomWritten.initialize(mainWritten).then(function () {
                    setTimeout(function () {
                        IsRuning = true;
                        $('#btn-start-stop').text("Stop").toggleClass('btn-stop').toggleClass('btn-start');
                        $('#btn-cmd').show(100).text('Writing Mode');
                    }, 3000);
                });
            }
            sdk.Compose.registerComposeViewHandler(function (composeView) {
                artyomWritten.redirectRecognizedTextOutput((recognized, isFinal) => {
                    if (isFinal) {
                        $('.AO-widgets').hide(300);
                        composeView.insertTextIntoBodyAtCursor(recognized);
                    } else {
                        $(".noti-text").text(recognized)
                        $('.AO-widgets').show(200);
                    }
                });
            });
        }
    }

    function ResetWritingbutton() {
        $('.btn-voice img').attr("src", Icons.voice_back);
        $('.AO-widgets').hide(300);
        $(".btn-voice").parents(".inboxsdk__button").attr("data-tooltip", "Start email writting  mode.")
    }
    function ActiveWritingbutton() {
        $('.btn-voice img').attr("src", Icons.voice_active);
        $(".btn-voice").parents(".inboxsdk__button").attr("data-tooltip", "Stop email writting  mode.")
    }

    function SwitchModeW_to_C() {
        ResetWritingbutton();
        artyomWritten.fatality().then(() => {
            $('#btn-cmd').show(100).text('Command Mode');
            IsRuning = true;
            artyomMain.initialize(mainConfig);
        });
    }

    function OkayResponse(cmd) {
        if (cmd) {
            ShowCommand(cmd);
        }
        artyomMain.sayRandom([
            "Okay",
            "Fine",
            "Sure",
            "All Right",
            "Cool"
        ]);
    }

    function ShowCommand(cmd) {
        $('#btn-cmd').show(100).text(cmd);
        setTimeout(function () {
            if (artyomMain.isRecognizing()) {
                $('#btn-cmd').text("Command Mode");
            } else if (artyomWritten.isRecognizing()) {
                $('#btn-cmd').text("Writing Mode");
            }
        }, 2000);
    }

});

