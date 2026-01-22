function sendGTM($form) {
    let category = ($form.data('gtm-category')) ? $form.data('gtm-category').trim() : '',
        action = ($form.data('gtm-action')) ? $form.data('gtm-action').trim() : '',
        label = ($form.data('gtm-label')) ? $form.data('gtm-label').trim() : '';

    if($form.find('[name="calculator"]').length) {
        let calc = $form.find('[name="calculator"]').val().trim();
        if(calc !== '') {
            action = 'calculate';
        }
    }

    if (category && action) {
        gtmEvents(category, action, label);
    }
}

function gtmEvents(category = '', action = '', label = '') {
    dataLayer.push({
        'event': 'eventTarget',
        'eventCategory': category,
        'eventAction': action,
        'eventLabel': label,
    });
}