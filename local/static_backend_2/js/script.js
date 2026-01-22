$(function() {

    if($('[data-counter-set]').length) {
        $('[data-counter-set]').each(function (i, el){
            let set = parseInt($(el).data('counter-set'));
            if(set > 0) {
                $(el).css('counter-set', 'order ' + set);
            }
        });
    }

    if($('.one-image[data-height]').length) {
        $('.one-image[data-height]').each(function (i, el){
            let height = parseInt($(el).data('height'));
            if(height > 0) {
                $(el).find('img').css('height', height);
            }
        });
    }

    $(window).scroll(function () {
        if ($(this).scrollTop() < 40) {
            $('header').removeClass('hide-top');
        } else {
            $('header').addClass('hide-top');
        }
    });

    $('.choices').on('change', function (e) {
        if($(this).find('.choices__list').html() == '') {
            $(this).removeClass('is-items');
        }
        else {
            $(this).addClass('is-items');
        }

        setTimeout(function () {
            $(this).parents('form').find('#page-value').val('');
            $(this).parents('form').trigger('submit');
        }, 300)
    })

    $('.choices').on('showDropdown', function (e) {
        $(this).parents('.projects__tags-block--label').addClass('is-open')
    })

    $('.choices').on('hideDropdown', function (e) {
        $(this).parents('.projects__tags-block--label').removeClass('is-open')
    })

    $('.choices__after').on('click', function (e) {
        $(this).parents('label').find('.choices').toggleClass('is-open');
    })

    $('.header__subtab.js-tab').on('mouseenter', function (e) {

        if(!$(this).hasClass('tab-active')) {
            $(this).parents('.header__tab-content').find('.header__subtab.js-tab').removeClass('tab-active');
            $(this).addClass('tab-active');

            let href = $(this).data('href');
            $(this).parents('.header__tab-content').find('.header__subtab-content.js-tab-content').removeClass('active');
            $('.header__subtab-content.js-tab-content[data-id="'+href+'"]').addClass('active');
        }

    })

    /* $(document).on('click', function (e) {
         if ($(e.target).closest(".header").length && $(e.target).closest(".header__bottom-menu").length) {
             return;
         }
         // клик снаружи элемента
         if($('.header__bottom-menu').hasClass('active')) {
             $('.header__bottom-menu-link.js-tab.tab-active').trigger('click');
         }
     });*/

    const btnTop = document.querySelector('.top_button');

    if (btnTop) {
        btnTop.addEventListener('click', () => {
            btnTop.style.display = 'none';

            var body = $("html, body");
            body.stop().animate({scrollTop:0}, 500, 'swing');
        });
    }

    window.addEventListener('scroll', check, {
        passive: true
    });

    function check() {
        if (window.scrollY > 500) {
            btnTop.style.display = 'block';
        } else {
            btnTop.style.display = 'none';
        }
    }

    check();


    function updateEvent(block) {
        let blockId = block.block.dataset.id;
        if(blockId) {
            setTimeout(function (){
                $.ajax({
                    url: '/local/ajax/logger.php',
                    data: 'action=update&block='+blockId,
                    type: 'POST',
                    cache: false,
                    dataType: 'json',
                    success: function (data) {

                    },
                });
            }, 500)
        }
    }

    BX.addCustomEvent('BX.Landing.Block:init', BX.delegate(
        function (block)
        {
            let blockId = block.block.dataset.id;
            if(blockId) {

                $.ajax({
                    url: '/local/ajax/logger.php',
                    data: 'action=new&block='+blockId,
                    type: 'POST',
                    cache: false,
                    dataType: 'json',
                    success: function (data) {

                    },
                });
            }
        }
    ));
    BX.addCustomEvent('BX.Landing.Block:Node:update', BX.delegate(
        function (block)
        {
            updateEvent(block);
        }
    ));
    BX.addCustomEvent('BX.Landing.Block:Card:add', BX.delegate(
        function (block)
        {
            updateEvent(block);
        }
    ));
    BX.addCustomEvent('BX.Landing.Block:Card:remove', BX.delegate(
        function (block)
        {
            updateEvent(block);
        }
    ));


    $('.landing-video[data-src=""], .content-videos__item-block[href=""][data-src=""], .content-videos__item-block[href="#"][data-src="#"]').on('click', function (e){
        e.preventDefault();
    });

    $('[data-career-name]').on('click', function (e){
        let vacancy = $(this).data('career-name');
        $('.modal-resume [name="vacancy"]').val(vacancy);
    });

    function link_is_external(link_element) {
        return (link_element.host !== window.location.host);
    }

    function validURL(str) {
        var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return !!pattern.test(str);
    }

    $('[data-path]').on('click', function (e) {
        e.preventDefault();
        let path = $(this).data('path'),
            commentary = $(this).data('commentary'),
            requestType = $(this).data('request-type'),
            $form = $('[data-target="' + path + '"] form');

        if(validURL(path)) {
            if(link_is_external(path))
                window.open(path, '_blank').focus();
            else
                window.location = path;

            return;
        }

        if (commentary != '') {
            $form.find('[name="commentary"]').val(commentary);
        }

        if (requestType != '' && requestType !== undefined) {
            $form.find('[name="RDVRequestTypeFromSiteId"]').val(requestType.trim());
        }

        let valueIdBlock;
        if($(this).parents('.block-wrapper').length) {
            valueIdBlock = $(this).parents('.block-wrapper').attr('id');
        } else {
            let blockId = $(this).attr('id');
            if(blockId != '')
                valueIdBlock = blockId;
        }

        if(valueIdBlock) {
            if($form.find('[name="ID_BLOCK"]').length) {
                $form.find('[name="ID_BLOCK"]').val(valueIdBlock);
            } else {
                $form.append('<input name="ID_BLOCK" type="hidden" value="'+valueIdBlock+'">');
            }
        }
    });

    $('.js-form-filter select,.js-form-filter input[type="checkbox"]').on('change', function (){
        setTimeout(function (){
            $('.js-form-filter').find('#page-value').val('');
            $('.js-form-filter').trigger('submit');
        }, 300);
    });

    Array.prototype.forEach.call(document.querySelectorAll('[type=radio]'), function(radio) {
        radio.addEventListener('click', function(){
            var self = this;
            // get all elements with same name but itself and mark them unchecked
            Array.prototype.filter.call(document.getElementsByName(this.name), function(filterEl) {
                return self !== filterEl;
            }).forEach(function(otherEl) {
                delete otherEl.dataset.check
            })

            // set state based on previous one
            if (this.dataset.hasOwnProperty('check')) {
                this.checked = false
                delete this.dataset.check;

                $('.js-form-filter input[name="section"][value="0"]').attr('checked', true).prop('checked', true);
            } else {
                this.dataset.check = ''
            }

            setTimeout(function (){
                $('.js-form-filter').find('#page-value').val('');
                $('.js-form-filter').trigger('submit');
            }, 300);

        }, false)
    });

    $('.js-form-filter input[name="catalogTags"]').on('click', function (){
        $('.js-form-filter').find('#page-value').val('');
        $('.js-form-filter [name="catalogTagsInner[]"]').attr('checked', false);
        $('.js-form-filter [name="catalogTagsInner[]"]').prop('checked', false);
        $('.js-form-filter .count-active').removeClass('count-active');
        setTimeout(function (){
            $('.js-form-filter').find('#page-value').val('');
            $('.js-form-filter').trigger('submit');
        }, 400);
    });

    $('.js-form-open-event').on('submit', function (e){
        e.preventDefault()

    });

    if($('.about-features__list').length) {
        $('.about-features__list').each(function (i, el){
            let text = $(el).text().trim();
            if(text == '')
                $(el).addClass('js-hide');
        });
    }

    if($('.g-bg[data-bg]').length) {
        $('.g-bg[data-bg]').each(function (i, el){
            let data_bg = $(el).data('bg'),
                style = $(el).attr('style');

            if(style == '--bg: ;') {
                $(el).removeClass('lazyloaded').removeClass('g-bg').removeAttr('style');

                if(data_bg != '' && data_bg != 'undefined')
                    $(el).css("background-image", "url('"+data_bg+"')");
            }
        });
    }

    if($('[data-ul-color-2]').length) {
        $('[data-ul-color-2]').each(function (i, el){
            let value_color = $(el).data('ul-color-2');
            $(this).css('--tooltip-color', value_color)
            //let color_class = $(el).data('ul-color-2') + '--before';
            //$(el).find('ul li').addClass(color_class);
        });
    }

    if($('[data-ol-color]').length) {
        $('[data-ol-color]').each(function (i, el){
            let color_class = $(el).data('ol-color') + '--before';
            $(el).find('ol li').addClass(color_class);
        });
    }

    $('.js-modal-form-tags').on('submit', function (e){
        e.preventDefault()

        $('.js-modal-form-tags [name="catalogTagsInner[]"]').each(function (i, el){
            let value = $(el).val();
            if($(el).is(':checked')) {
                $('.catalog__filter.js-form-filter [name="catalogTagsInner[]"][value="'+value+'"]').prop('checked', true);
            } else {
                $('.catalog__filter.js-form-filter [name="catalogTagsInner[]"][value="'+value+'"]').prop('checked', false);
            }
        });

        $('.catalog__filter.js-form-filter').trigger('submit');
        $(this).parents('.modal').find('.modal-close').trigger('click')
    });

    $('.js-form-filter .catalog__filter-reset, .js-form-filter .catalog__reset-button, .js-form-filter .projects__filter-reset').on('click', function (e){
        setTimeout(function (){
            $('.js-form-filter').find('#page-value').val('');
            $('.js-form-filter').trigger('submit');
        }, 500)
    });

    $('.js-modal-change-year').on('change', function (){
        let $form = $(this).parents('form'),
            year = $(this).find('option:selected').val();

        $form.find('.modal-dates__months').hide();
        $form.find('.modal-dates__months[data-year="'+year+'"]').show();
    });

    $('.js-type-view').on('click', function (){
        let $form = $(this).parents('form'),
            type = $(this).data('view')

        $form.find('#type-view').val(type);
    });

    $('.js-category-form input[type="radio"]').on('change', function (e){
        let category = $(this).parents('form').find('[name="category"]:checked').val();
        $('.js-form-filter [name="category"]').val(category);
        $('.js-form-filter').trigger('submit');
    });

    $('.js-category-form-new input[type="radio"]').on('change', function (e){
        let category = $(this).parents('form').find('[name="category"]:checked').val();

        $('.js-form-filter .js-more-button-item[data-parent]').hide();
        $('.js-form-filter .js-more-button-item[data-parent="'+category+'"]').show();

        $('.js-form-filter').find('#page-value').val('');
        $('.js-form-filter [name="catalogTagsInner[]"]').attr('checked', false);
        $('.js-form-filter [name="catalogTagsInner[]"]').prop('checked', false);
        $('.js-form-filter [name="catalogTags[]"]').attr('checked', false);
        $('.js-form-filter [name="catalogTags[]"]').prop('checked', false);
        $('.js-form-filter .count-active').removeClass('count-active');


        $('.js-form-filter .catalog__filter-bottom-content.js-tab-content.active').removeClass('active');


        $('.js-form-filter [name="category-new"]').val(category);
        $('.js-form-filter').trigger('submit');
    });

    $(document).on('keyup', '.js-form-filter #catalogSearch, .js-form-filter #careerSearch', function (e){
        $('.js-form-filter').find('#page-value').val('');
        $(this).parents('form').trigger('submit');
    });

    $(document).on('click', '.catalog__search-reset', function (e){
        $('.js-form-filter #catalogSearch').val('');
        $(this).parents('form').trigger('submit');
    });

    $(document).on('click', '.js-reset-date', function (e){
        let $form = $(this).parents('form');
        setTimeout(function (){
            $form.find('#page-value').val('');
            $form.trigger('submit');
        }, 300)
    });

    $(document).on('click', '[data-fancybox="gallery-team"]', function (e){
        e.preventDefault();
    });

    $(document).on('click', '.about-partners__slide[href="#"]', function (e){
        e.preventDefault();
    });

    /*$(document).on('click', '.content-videos__item-block', function (e){
        e.preventDefault();
        let href = $(this).attr('href');
    });*/

    /*    $.Fancybox.bind(".content-videos__item-block", {
            // Your custom options
        });*/


    $('.js-popup-filter-date input').on('change', function (e){
        let name = $(this).attr('name'),
            value = $(this).val();

        if($(this).is(':checked')) {
            $('.js-form-filter').find('[name="'+name+'"][value="'+value+'"]').prop('checked', true);
        } else {
            $('.js-form-filter').find('[name="'+name+'"][value="'+value+'"]').prop('checked', false);
        }
    });

    /*$('[name="catalogTags"]').on('click change', function (e){
        let value = $(this).parents('.catalog__tag').find('.catalog__tag-label').text();
        $('.js-catalog-modal-title').html(value);
    });

    $('.catalog__tags-more').on('click', function (e){
        $('.js-catalog-modal-title').html('Все теги');
    });*/

    $('.js-popup-filter-date [type="reset"]').on('click', function (e){
        $('.js-form-filter [data-id="catalogDate"] input').prop('checked', false);
        $('.js-form-filter').trigger('submit');
        $(this).parents('.modal').find('.modal-close').trigger('click')
    });

    $('.js-popup-filter-date select').on('change', function (e){
        let name = $(this).attr('name'),
            value = $(this).find(':selected').val();

        $('.js-form-filter').find('[name="'+name+'"]').val(value);
    });

    $('.js-popup-filter-date').on('submit', function (e) {
        e.preventDefault();
        $('.js-form-filter').trigger('submit');
        $(this).parents('.modal').find('.modal-close').trigger('click')
    });

    /* $('.js-form-filter-events .js-load-more-json').on('click', function (e) {
         e.preventDefault();
         let url = $(this).data('url');
         const searchParams = new URLSearchParams(pageHref.substring(url.indexOf('?')));
         const pageNumber = searchParams.get('PAGEN_3');

         $('.js-form-filter-events [name="PAGEN_3"]').val(pageNumber);
         $('.js-form-filter-events [name="AJAX"]').val('Y');

     });*/

    let choices = $('.choices');
    if(choices.length) {
        choices.each(function (i,el){
            if($(el).find('select option').length) {
                $(el).addClass('is-items')
            } else {
                $(el).removeClass('is-items')
            }
        });
    }

    $('.js-form-filter').on('submit', function (e) {
        e.preventDefault();
        let $form = $(this),
            $btn = $form.find('button[type="submit"]');

        if (!$form.hasClass('loading')) {
            $form.addClass('loading');

            $.ajax({
                url: $form.data('action'),
                data: $form.serialize(),
                type: 'POST',
                cache: false,
                dataType: 'json',
                success: function (data) {
                    if (data.success === true) {

                        $('.js-load-more-events').remove();

                        if($form.hasClass('js-form-filter-career') || $form.hasClass('js-form-filter-events')) {

                            let filter1 = $form.find('[name="FILTER_1[]"]').val(),
                                filter2 = $form.find('[name="FILTER_2[]"]').val(),
                                filter3 = $form.find('[name="FILTER_3[]"]').val(),
                                searchValue = $form.find('[name="catalogSearch"]').val(),
                                set_url = [];

                            if(filter1 != '')
                                set_url.push('FILTER_1[]='+filter1);
                            if(filter2 != '')
                                set_url.push('FILTER_2[]='+filter2);
                            if(filter3 != '')
                                set_url.push('FILTER_3[]='+filter3);
                            if(searchValue != '')
                                set_url.push('catalogSearch='+searchValue);

                            if(set_url){
                                window.history.replaceState( {} , $('title').text().trim(), window.location.pathname + '?'+set_url.join('&') );
                            }

                            $('.js-load-more').remove();
                            $('.js-load-more-json').remove();
                            let elements = $(data.html),
                                pagination = $(data.more);

                            $('.js-more-container').html(elements);
                            $('.js-more-container').after(pagination);
                        } else {
                            //$('.js-load-more').remove();
                            $('.js-more-container').html(data.html);
                        }

                        if($(this).find('[name="type-view"]').hasClass('active')) {
                            $('.catalog-card').addClass('.catalog-card--row');
                        }

                        if(
                            $form.data('action') == '/local/ajax/projects.php'
                            || $form.data('action') == '/local/ajax/events.php'
                        ) {
                            projectsMoreTags();
                        }
                    } else {

                    }
                    $form.removeClass('loading');
                },
                error: function () {
                    $form.removeClass('loading');
                }
            });

        }
    });

    $(document).on('click', '.js-load-more', function (e) {
        e.preventDefault();

        var targetContainer = $('.js-more-container'),
            url = $('.js-load-more').attr('data-url');
        if (url !== undefined) {
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'html',
                success: function (data) {
                    $('.js-load-more').remove();
                    $('.js-load-more-navigation').remove();
                    var elements = $(data).find('.js-more-item'),
                        pagination = $(data).find('.js-load-more'),
                        navigation = $(data).find('.js-load-more-navigation');
                    //console.log(elements)
                    targetContainer.append(elements);
                    targetContainer.after(navigation);
                    targetContainer.after(pagination);
                }
            })
        }
    });

    $(document).on('click', '.js-load-more-events', function (e) {
        e.preventDefault();

        var targetContainer = $('.js-more-container'),
            url = $(this).attr('data-url'),
            page = $(this).attr('data-page'),
            form = $('.js-form-filter-events');

        form.find('#page-value').val(page);

        if (url !== undefined) {
            $.ajax({
                type: 'GET',
                url: form.data('action'),
                data: form.serialize(),
                dataType: 'json',
                success: function (data) {
                    $('.js-load-more').remove();
                    $('.js-load-more-events').remove();
                    $('.js-load-more-navigation').remove();
                    var elements = $(data.html),
                        pagination = $(data.more);

                    targetContainer.append(elements);
                    targetContainer.after(pagination);

                    if(form.data('action') == '/local/ajax/projects.php') {
                        projectsMoreTags();
                    }
                }
            })
        }
    });

    $(document).on('click', '.js-load-more-json', function (e) {
        e.preventDefault();

        var targetContainer = $('.js-more-container'),
            url = $(this).attr('data-url');

        if (url !== undefined) {
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'html',
                success: function (data) {

                    $('.js-load-more-json').remove();
                    let elements = $(data).find('.js-more-item'),
                        pagination = $(data).find('.js-load-more-json');

                    targetContainer.append(elements);
                    targetContainer.after(pagination);
                }
            })
        }
    });

    if ($('.js-clear-parent-block').length) {
        $('.js-clear-parent-block').each(function (i, el) {
            let text = $(el).text().trim(),
                $parent = $(el).parents($(el).data('parent'));
            if (text.length == 0)
                $parent.addClass('js-hide');
        });
    }

    if ($('.expertise__item').length) {
        $('.expertise__item').each(function (i, el) {

            let hide = true;
            $(el).find('.expertise__item-tag').each(function (i2, el2) {
                let text = $(el2).text().trim();
                if(text.length > 0)
                    hide = false;
            })
            if (hide)
                $(el).find('.expertise__item-tags').addClass('js-hide');
        });
    }

    $(document).on('submit', '.js-form-send-home', function (e) {
        e.preventDefault();

        let $form = $(this),
            $output = $(this).find('.js-output'),
            $btn = $form.find('button[type="submit"]'),
            key = $('#recaptcha-public').val(),
            emailValue;

        if($form.hasClass('js-form-send-home-event')) { //мероприятия
            emailValue = $form.find('[name="email"]').val();
        }

        console.log($form.find('.parsley-errors-list li'));
        if($form.find('.parsley-errors-list li').length) {
            return;
        }

        if (!$form.hasClass('loading')) {
            $form.addClass('loading');
            $btn.attr('disabled', true);
            $output.text('');
            $form.removeClass('success');

            grecaptcha.ready(function () {
                grecaptcha.execute(key, {
                    action: 'sendform'
                })
                    .then(function (token) {

                        $form.find('[name="g-recaptcha-response"]').val(token);

                        if($form.parents('.block-wrapper').length) {
                            let valueIdBlock = $form.parents('.block-wrapper').attr('id');

                            if($form.find('[name="ID_BLOCK"]').length) {
                                $form.find('[name="ID_BLOCK"]').val(valueIdBlock);
                            } else {
                                $form.append('<input name="ID_BLOCK" type="hidden" value="'+valueIdBlock+'">');
                            }
                        }

                        $.ajax({
                            url: $form.attr('action'),
                            data: new FormData($form[0]),
                            processData: false,
                            contentType: false,
                            type: 'POST',
                            cache: false,
                            dataType: 'json',
                            success: function (data) {
                                if (data.success === true) {

                                    sendGTM($form);

                                    $form[0].reset();
                                    $form.find('.js-validation-wrapper').removeClass('success');
                                    $form.find('.input--phone').removeClass('success');
                                    // $output.html('Спасибо! Ваша заявка отправлена.');
                                    // $form.addClass('success');

                                    window.rdv_API.modal.close();
                                    if($form.hasClass('js-form-send-home-event')) { //мероприятия
                                        $('.modal-registration-success .js-email').text(emailValue);
                                        window.rdv_API.modal.onOpen("registration-success-2");
                                    } else {
                                        window.rdv_API.modal.onOpen("success");
                                    }

                                } else {

                                    let errorTxt = '', error_ip = false;
                                    $.each(data.errors, function( index, value ) {
                                        if(index == 'ip') {
                                            error_ip = true;
                                        } else {
                                            errorTxt += value+'. ';
                                        }
                                    });

                                    if(errorTxt == '' && error_ip) {
                                        window.rdv_API.modal.onOpen("error-ip");
                                    } else {
                                        $output.text(errorTxt);
                                    }


                                    // window.rdv_API.modal.close();
                                    // window.rdv_API.modal.onOpen("error");
                                }
                                $form.removeClass('loading');
                                $btn.attr('disabled', false);
                            },
                            error: function () {
                                $form.removeClass('loading');
                                $btn.attr('disabled', false);
                            }
                        });

                    });
            });

        }
    });


    $(document).on('click', '.js-more-button, .js-accordion-btn', function (e) {
        setTimeout(function (){
            window.initSticky;
            window.dispatchEvent(new Event('resize'));
        }, 500)
    });

    setTimeout(function (){
        window.initSticky;
        window.dispatchEvent(new Event('resize'));
    }, 500);


    $(document).on('click', '.js-form-action', function (e) {
        e.preventDefault();
        $(this).parents('form').trigger('submit');
    });
    $(document).on('click', '.js-close-search-button', function (e) {
        e.preventDefault();
        $(this).parents('.header__search').removeClass('active');
    });

});

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null) {
        return null;
    }
    return decodeURI(results[1]) || 0;
}

function projectsMoreTags () {
    document.querySelectorAll(".js-more-button-row-container").forEach(function (t) {
        if (matchMedia("(max-width: 1024px)").matches || !t.dataset.tablet) {
            var e = t.querySelector(".js-more-button-row"), n = [], i = t.querySelectorAll(".js-more-button-row-item");
            (i = Array.from(i).filter(function (e) {
                return e.closest(".js-more-button-row-container").isEqualNode(t)
            })).forEach(function (e) {
                return e.classList.remove("visually-hidden")
            });
            for (var r, o = 1, a = t.dataset.rowsCount || 2; t.clientHeight > i[0].clientHeight * a - i[0].clientHeight / 2;) {
                var s = i[i.length - o];
                n.push(s), s.classList.add("visually-hidden"), o++
            }
            if (e && e.classList.remove("visually-hidden"), 0 === n.length) return e ? void e.classList.add("visually-hidden") : void 0;
            e && ((r = e.querySelector(".js-more-button-row-surplus")) && (r.textContent = n.length.toString()), e.addEventListener("click", function () {
                n.forEach(function (e) {
                    return e.classList.remove("visually-hidden")
                }), e.classList.add("visually-hidden")
            }))
        }
    });

    alignHeights(".cards-section",".partners-card__title");
}

function alignHeights(parentSelector, elementSelector, notOnMobile) {
    const container = document.querySelector(parentSelector);
    if (!container) return;

    if (notOnMobile && matchMedia('(max-width: 640px)').matches) return;

    const elements = container.querySelectorAll(elementSelector);

    if (elements.length === 0) return;

    const setMaxHeight = () => {
        let height = 0;

        //Определяем максимальную высоту блока
        for(let i = 0; i < elements.length; i++ ){
            // Обнуляем height, иначе при ресайзе будет баг
            elements[i].style.height = 'auto';

            let currentHeight = elements[i].clientHeight;
            if(currentHeight > height) {
                height = currentHeight;
            }
        }
        //Задаем максимальную высоту блока всем элементам
        for( let i = 0; i < elements.length; i++ ){
            elements[i].style.height = height + 'px';
        }
    }

    setMaxHeight();

    window.addEventListener('resize', setMaxHeight);
}

/*const inputPhones2 = document.querySelectorAll('.js-phone-input');
inputPhones2.forEach(function (inputPhone) {
    inputPhone.addEventListener("paste", (event) => {
        event.preventDefault();

        let paste = (event.clipboardData || window.clipboardData).getData("text");
        paste = paste.replace(/\D/g, "").replace(/^8/, "");

        inputPhone.value= paste;
        return paste;
    });

    inputPhone.addEventListener("input", mask);
    inputPhone.addEventListener("focus", mask);
    inputPhone.addEventListener("blur", mask);
});*/


function mask(event) {
    var blank = "+_ (___) ___-__-__";

    var i = 0;

    var val = this.value.replace(/\D/g, "").replace(/^8/, "7").replace(/^78/, "7");
    var len = this.value.length;
    this.value = val.replace(/^7/, "").replace(/^8/, "7");
};

function setCursorPosition(elem, pos) {
    elem.focus();

    if (elem.setSelectionRange) {
        elem.setSelectionRange(pos, pos);
        return;
    }

    if (elem.createTextRange) {
        var range = elem.createTextRange();
        range.collapse(true);
        range.moveEnd("character", pos);
        range.moveStart("character", pos);
        range.select();
        return;
    }
}