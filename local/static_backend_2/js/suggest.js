let token = '14fc203e9aa48c9bd75846894ede13e66033c30b';
$(document).ready(function (){

    $(document).on('keyup', '[type="email"]', function (e) {
        let value = $(this).val();
        const regex = /^(.*?)@/gm;
        let m, find = false;

        while ((m = regex.exec(value)) !== null) {
            find = true;
        }

        if(!find) {
            setTimeout(function () {
                $(this).removeClass('show');
            }, 500)
        }
    });

    $('[type="email"]').suggestions({
        token: token,
        type: "EMAIL",
        beforeRender: function (container) {
            $(this).addClass('show');
        },
        onSelect: function(suggestion, changed) {
            $(this).removeClass('show').removeClass('is-error');
            $(this).parents('.input-wrapper').find('.parsley-errors-list').remove();
        },
        onSelectNothing: function (query) {
            $(this).removeClass('show');
        },
        onInvalidateSelection: function (suggestion) {
            $(this).removeClass('show');
        },
        onSearchStart: function (params) {
            const regex = /^(.*?)@/gm;
            let m, find = false;

            while ((m = regex.exec(params.query)) !== null) {
                find = true;
            }

            if(!find) {
                params.query = '';
            }
        }
    });

    $('[name="company"]').suggestions({
        token: token,
        type: "PARTY",
        count: 20,
        params: {
            status:  ["ACTIVE"]
        },
        beforeRender: function (container) {
            $(this).addClass('show');
        },
        onSelect: function(suggestion, changed) {
            $(this).removeClass('show').removeClass('is-error');
            $(this).parents('.input-wrapper').find('.parsley-errors-list').remove();
        },
        onSelectNothing: function (query) {
            $(this).removeClass('show');
        },
        onInvalidateSelection: function (suggestion) {
            $(this).removeClass('show');
        },
        onSearchStart: function (params) {
            //console.log(params)
        }
    });

    $(document).on('keyup', '[name="company"]', function (e) {
        let value = $(this).val();

        if(!value) {
            setTimeout(function () {
                $(this).removeClass('show');
            }, 500)
        }
    });

    $(document).on('keyup', '[name="phone"]', function (e) {
        let value = $(this).val().trim(), $this = $(this), $parent = $(this).parents('.input-wrapper');

        const regex = /\D+/gm;
        const subst = ``;
        const result = value.replace(regex, subst);
        $parent.find('.parsley-errors-list').remove();

        if(result.length > 10) {
            $.ajax({
                url: '/local/ajax/check-phone.php',
                data: 'phone='+value,
                type: 'POST',
                cache: false,
                dataType: 'json',
                success: function (data) {
                    if(data.success == true) {
                        $this.removeClass('is-error');
                        $parent.find('.parsley-errors-list').remove()
                    } else {
                        $this.addClass('is-error');
                        $parent.find('.parsley-errors-list').remove();
                        $parent.append('<ul class="parsley-errors-list filled" aria-hidden="false"><li class="parsley-minlength">'+data.error+'</li></ul>');
                    }
                },
            });
        } else {
            $this.addClass('is-error');
            $parent.find('.parsley-errors-list').remove();
            $parent.append('<ul class="parsley-errors-list filled" aria-hidden="false"><li class="parsley-minlength">Введите корректный номер телефона</li></ul>');
        }
    });
});

function valueHasEmail(value) {
    const regex = /@/gm;
    let m, hasEmail = false;
    while ((m = regex.exec(value)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        hasEmail = true;
    }
    return hasEmail;
}

function getEmail(query) {
    var url = "//suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/email";
    var token = "14fc203e9aa48c9bd75846894ede13e66033c30b";

    var options = {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": "Token " + token
        },
        body: JSON.stringify({query: query})
    }

    fetch(url, options)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log("error", error));
}