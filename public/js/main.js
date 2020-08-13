'use strict';

const SESSION_REFRESH_TIME = 10000; // ms

// fonction utilitaire permettant de faire du
// lazy loading (chargement à la demande) des templates
const templates = (() => {
    let templates = {};
    return function load(url) {
        if (templates[url]) {
            return Promise.resolve(templates[url]); // systeme de caching
        }
        else {
            return fetch(url)
                .then(res => res.text())
                .then(text => {
                    return templates[url] = text;
                });
        }
    };
})();

// Fonction utilitaire qui permet de charger en parallèle les
// différents 'partial' (morceaux de template. Ex: header)
const loadPartials = (() => {
    let partials;
    return async function loadPartials() {
        if (!partials) {
            partials = {
                menu: templates('/public/templates/menu.mustache'),
                header_accueil: templates('/public/templates/header-accueil.mustache'),
                header_all: templates('/public/templates/header-all.mustache'),
                footer: templates('/public/templates/footer.mustache')
            };
            const promises = Object.entries(partials).map(async function ([k, v]) {
                return [k, await v];
            });
            partials = Object.fromEntries(await Promise.all(promises));
        }
        return partials;
    };
})();

// fonction utilitaire de rendu d'un template
const renderTemplate = async function (template, context) {
    // On charge les partials (si pas déà chargés)
    const partials = await loadPartials();
    if (context.success) {
        if (context.type === 3 || context.type === 2) {
            // si etu ou prof
            context.nom = context.nom.toUpperCase();
            if (context.type === 3) {
                context.show_profil = true;
                context.show_pts_counter = true; // affiche # polypoint(s) et # point(s) de bonification
                // si etu
                if (!context.somme_pts_activite) context.somme_pts_activite = 0;
                if (!context.somme_pts_evenement) context.somme_pts_evenement = 0;
            }
            else {
                context.add_blank = true;
            }
        }
        else {
            context.show_admin_panel = true;
            context.add_blank = true;

            context.nom = 'ADMINISTRATEUR';
            context.prenom = '';
        }
    }

    // On rend le template
    const rendered = Mustache.render(await template, context, partials);

    // Et on l'insère dans le body
    let body = document.querySelector('body');
    body.innerHTML = rendered;

    /*if (sessionGet('page_to_render') !== '') {
        document.getElementById(sessionGet('page_to_render')).classList.add('active');
    }*/
};

// Sale mais fonctionnel #JS..
const sessionGet = (key) => JSON.parse(sessionStorage.getItem(key));
const sessionSet = (key, value) => sessionStorage.setItem(key, JSON.stringify(value));

/********** PAGE **********/

// TODO : 404 Page
// page('*', gestion404);

/* -------- Accueil -------- */

page('/', async function () {
    sessionSet('page_to_render', '');
    await renderTemplate(templates('/public/templates/accueil.mustache'), sessionGet('session'));
    window.scrollTo(0, 0);

    accueil();
    header();

    $('#button-rejoindre-header').click( () => { page.redirect('/nous-rejoindre'); });
    $('#button-contacter-header').click( () => { page.redirect('/contact'); });
    $('#input-contact').click( () => { page.redirect('/contact'); });
    $('#input-more-info').click( () => { page.redirect('/services'); });

    let email = $('#input-email-newsletter');

    email.keypress((e) => {
        if (email.val().length > 99) e.preventDefault();
    });

    $('#input-send-newsletter').click( () => {

        if( email.val().match(/^([\w-.]+)@((?:[\w]+\.)+)([a-zA-Z]{2,4})/i) ){
            $.ajax('/api/newsletter', {
                data: { mail: email.val() },
                method: 'POST'
            }).done(() => {
                email.val('');

                $('#error-mail-newsletter').fadeOut(500);
                $('#error-interne-newsletter').fadeOut(500);

                $('#validation-newsletter').fadeIn(500).delay(3000).fadeOut(500);
                email.css('border', '2px solid #5269FF');
            }).fail((res) => {
                email.css('border', '2px solid red');
                if(res.status === 422){
                    $('#error-interne-newsletter').fadeOut(500);
                    $('#validation-newsletter').fadeOut(500);

                    $('#error-mail-newsletter').fadeIn(500);
                } else {
                    $('#error-mail-newsletter').fadeOut(500);
                    $('#validation-newsletter').fadeOut(500);

                    $('#error-interne-newsletter').fadeIn(500);
                }
            });
        } else {
            email.css('border', '2px solid red');
            $('#error-mail-newsletter').fadeIn(500);
        }
    });

    $('#input-join-us').click( () => { page.redirect('/nous-rejoindre'); });
    $('#adriz-footer').click( () => { page.redirect('/'); });
});

/* -------- Services -------- */

page('services', async function () {
    sessionSet('page_to_render', 'services');
    await renderTemplate(templates('/public/templates/services.mustache'), sessionGet('session'));
    window.scrollTo(0, 0);

    header();
    service();

    $('#input-analyse').click( () => { page.redirect('/nous-rejoindre'); });
    $('#input-question').click( () => { page.redirect('/contact'); });


});

/* -------- Agence -------- */

page('agence', async function () {
    sessionSet('page_to_render', 'agence');
    await renderTemplate(templates('/public/templates/agence.mustache'), sessionGet('session'));
    window.scrollTo(0, 0);

    header();
    agence();

    $('#input-rejoindre').click(() => { page.redirect('/nous-rejoindre'); });
});

/* -------- Équipe -------- */

page('equipe', async function () {
    sessionSet('page_to_render', 'equipe');
    await renderTemplate(templates('/public/templates/equipe.mustache'), sessionGet('session'));
    window.scrollTo(0, 0);

    header();
    equipe();

    $('#button-contact').click(() => { page.redirect('/contact'); });
});

/* -------- Contact -------- */

page('contact', async function () {
    sessionSet('page_to_render', 'contact');
    await renderTemplate(templates('/public/templates/contact.mustache'), sessionGet('session'));
    window.scrollTo(0, 0);

    header();
    contact();

    let nom = $('#input-nom');
    nom.keypress((e) => {
        if (nom.val().length > 99) e.preventDefault();
    });

    let prenom = $('#input-prenom');
    prenom.keypress((e) => {
        if (prenom.val().length > 99) e.preventDefault();
    });

    let mail = $('#input-mail');
    mail.keypress((e) => {
        if (mail.val().length > 99) e.preventDefault()
    });

    let message = $('#text-message');
    message.keypress((e) => {
        if (message.val().length > 99) e.preventDefault();
    });

    $('#form-contact').submit((event) => {

        event.preventDefault();

        let mailValid = true;

        if( !mail.val().match(/^([\w-.]+)@((?:[\w]+\.)+)([a-zA-Z]{2,4})/i) ){
            $('#error-mail').fadeIn(500);
            mail.css('border', '2px solid red');
            mailValid = false;
        }

        const data = {
            nom: nom.val(),
            prenom: prenom.val(),
            mail: (mailValid ? mail.val() : ''),
            message: message.val()
        }

        $.ajax('/api/contact', {
            data: data,
            type: 'POST',
        }).done(() => {
            nom.val('');
            prenom.val('');
            mail.val('');
            message.val('');

            $('#validation-formulaire-contact').fadeIn(500).delay(3000).fadeOut(500);

            $('#error-formulaire-contact').fadeOut(500);

            $('#error-nom').fadeOut(500);
            nom.css('border', '2px solid #5269FF');

            $('#error-prenom').fadeOut(500);
            prenom.css('border', '2px solid #5269FF');

            $('#error-mail').fadeOut(500);
            mail.css('border', '2px solid #5269FF');

            $('#error-message').fadeOut(500);
            message.css('border', '2px solid #5269FF');
        }).fail((res) => {
            if(res.status === 422) {
                $('#error-formulaire-contact').fadeOut(500);

                if( res.responseJSON.some( elem => elem.param === 'nom') ){
                    $('#error-nom').fadeIn(500);
                    nom.css('border', '2px solid red');
                } else {
                    $('#error-nom').fadeOut(500);
                    nom.css('border', '2px solid #5269FF');
                }

                if( res.responseJSON.some( elem => elem.param === 'prenom') ){
                    $('#error-prenom').fadeIn(500);
                    prenom.css('border', '2px solid red');
                } else {
                    $('#error-prenom').fadeOut(500);
                    prenom.css('border', '2px solid #5269FF');
                }

                if( res.responseJSON.some( elem => elem.param === 'mail') ){
                    $('#error-mail').fadeIn(500);
                    mail.css('border', '2px solid red');
                } else {
                    $('#error-mail').fadeOut(500);
                    mail.css('border', '2px solid #5269FF');
                }

                if( res.responseJSON.some( elem => elem.param === 'message') ){
                    $('#error-message').fadeIn(500);
                    message.css('border', '2px solid red');
                } else {
                    $('#error-message').fadeOut(500);
                    message.css('border', '2px solid #5269FF');
                }
            } else {
                $('#error-formulaire-contact').fadeIn(500);

                $('#error-nom').fadeOut(500);
                nom.css('border', '2px solid #5269FF');

                $('#error-prenom').fadeOut(500);
                prenom.css('border', '2px solid #5269FF');

                $('#error-mail').fadeOut(500);
                mail.css('border', '2px solid #5269FF');

                $('#error-message').fadeOut(500);
                message.css('border', '2px solid #5269FF');
            }
        });
    });
});

/* -------- Contact -------- */

page('nous-rejoindre', async function () {
    sessionSet('page_to_render', 'rejoindre');
    await renderTemplate(templates('/public/templates/rejoindre.mustache'), sessionGet('session'));
    window.scrollTo(0, 0);

    header();
    rejoindre();

    let email = $('#input-email-newsletter-a-venir');

    email.keypress((e) => {
        if (email.val().length > 99) e.preventDefault();
    });

    $('#input-contact-a-venir').click( () => { page.redirect('/contact'); })
    $('#input-send-newsletter-a-venir').click( () => {

        if( email.val().match(/^([\w-.]+)@((?:[\w]+\.)+)([a-zA-Z]{2,4})/i) ){
            $.ajax('/api/newsletter', {
                data: { mail: email.val() },
                method: 'POST'
            }).done(() => {
                email.val('');

                $('#error-mail-newsletter-a-venir').fadeOut(500);
                $('#error-interne-newsletter-a-venir').fadeOut(500);

                $('#validation-newsletter-a-venir').fadeIn(500).delay(3000).fadeOut(500);
                email.css('border', '2px solid #5269FF');
            }).fail((res) => {
                email.css('border', '2px solid red');
                if(res.status === 422){
                    $('#error-interne-newsletter-a-venir').fadeOut(500);
                    $('#validation-newsletter-a-venir').fadeOut(500);

                    $('#error-mail-newsletter-a-venir').fadeIn(500);
                } else {
                    $('#error-mail-newsletter-a-venir').fadeOut(500);
                    $('#validation-newsletter-a-venir').fadeOut(500);

                    $('#error-interne-newsletter-a-venir').fadeIn(500);
                }
            });
        } else {
            email.css('border', '2px solid red');
            $('#error-mail-newsletter-a-venir').fadeIn(500);
        }
    });
});

/********** ANIMATIONS **********/

/* -------- Header -------- */

function header() {
    $('#menu').click( () => {
        $('#div-menu').css('width', '100%').after( () => {
            $('.span-menu').fadeIn(500);
        });
    });

    $('#div-close-menu').click( () => {
        $('.span-menu').hide();
        $('#div-menu').css('width', '0');
    });

    $('#button-close-menu').click( () => {
        $('.span-menu').hide();
        $('#div-menu').css('width', '0');
    });

    $('#div-nav-adriz').click( () => {

        let div = $('#div-sous-menu');

        if( div.hasClass('show-sous-menu') ) {
            $('.img-sous-menu').fadeOut();
            $('.span-sous-menu').fadeOut();
            setTimeout(() => {
                div.removeClass('show-sous-menu');
                setTimeout(() => {
                    $('#nav-menu').removeClass('nav-sous-menu');
                }, 500);
            }, 200);
        } else {
            div.addClass('show-sous-menu');
            setTimeout(() => {
                $('#nav-menu').addClass('nav-sous-menu');
                $('.img-sous-menu').fadeIn(750);
                $('.span-sous-menu').fadeIn(750);
            }, 200)
        }
    });

    $('#div-nav-accueil').click( () => { page.redirect('/'); });
    $('#div-nav-services').click( () => { page.redirect('/services'); });
    $('#div-nav-agence').click( () => { page.redirect('/agence'); });
    $('#div-nav-equipe').click( () => { page.redirect('/equipe'); });
    $('#div-nav-contact').click( () => { page.redirect('/contact'); });
    $('#div-nav-rejoindre').click( () => { page.redirect('/nous-rejoindre'); });

    $('#adriz-header').click( () => { page.redirect('/'); });
}

/* -------- Accueil -------- */

function accueil(){

    $('h1').fadeIn(1000);
    setTimeout(() => {
        $('#adriz-presentation').fadeIn(1000);
        setTimeout(() => {
            $('#digital-img').show(1000);
            setTimeout(() => {
                $('#button-rejoindre-header').fadeIn(1000);
                $('#button-contacter-header').fadeIn(1000);
            }, 250);
        }, 500);
    }, 500);

    $(window).scroll(() => {

        let elem;

        if ($(window).scrollTop() > 10) {
            $('#adriz-header').addClass('reduce-adriz');
            $('#menu').addClass('reduce-menu');
            $('header').addClass('color');
        } else if ($(window).scrollTop() < 9) {
            $('#adriz-header').removeClass('reduce-adriz');
            $('#menu').removeClass('reduce-menu');
            $('header').removeClass('color');
        }

        if( $(window).scrollTop() > 350 ) {
            $('#smma-definition').fadeIn(1000);
            $('#smma-role').fadeIn(1000);
        } else if( $(window).scrollTop() === 0 ) {
            $('#smma-definition').fadeOut();
            $('#smma-role').fadeOut();
        }

        if( $(window).scrollTop() > 600 ) {
            $('#h2-service-1').fadeIn(1000);
            $('#img-service-1').show(1000);
            elem = $('#div-description-service-1');
            elem.fadeIn(1000);
            elem.css('display', 'grid');
            $('.icon-service-1').fadeIn(1000);
            $('.p-service-1').fadeIn(1000);
        } else if( $(window).scrollTop() < 300 ) {
            $('#div-description-service-1').fadeOut();
            $('#h2-service-1').fadeOut();
            $('#img-service-1').fadeOut();
            $('.icon-service-1').fadeOut();
            $('.p-service-1').fadeOut();
        }

        if( $(window).scrollTop() > 950 ) {
            $('#h2-service-2').fadeIn(1000);
            $('#div-img-service-2').fadeIn(1000);
            $('#img-service-2').fadeIn(1000);
            elem = $('#div-description-service-2');
            elem.fadeIn(1000);
            elem.css('display', 'grid');
            $('.icon-service-2').fadeIn(1000);
            $('.p-service-2').fadeIn(1000);
        } else if( $(window).scrollTop() < 600 ) {
            $('#div-description-service-2').fadeOut();
            $('#h2-service-2').fadeOut();
            $('#div-img-service-2').fadeOut();
            $('#img-service-2').fadeOut();
            $('.icon-service-2').fadeOut();
            $('.p-service-2').fadeOut();
        }

        if( $(window).scrollTop() > 1350 ) {
            elem = $('#h2-question');
            elem.fadeIn(1000);
            elem.css('display', 'flex');
            $('#input-contact').fadeIn(1000);
        } else if( $(window).scrollTop() < 1000 ) {
            $('#h2-question').fadeOut();
            $('#input-contact').fadeOut();
        }

        if( $(window).scrollTop() > 1500 ) {
            elem = $('#div-description-facebook');
            elem.fadeIn(1000);
            elem.css('display', 'grid');
            $('#h3-facebook-ads').fadeIn(1000);
            $('#hr-facebook-ads').fadeIn(1000);
            $('#p-facebook-ads').fadeIn(1000);
            $('#img-facebook-ads').fadeIn(1000);

            elem = $('#div-description-youtube');
            elem.fadeIn(1000);
            elem.css('display', 'grid');
            $('#h3-youtube-advertising').fadeIn(1000);
            $('#hr-youtube-advertising').fadeIn(1000);
            $('#p-youtube-advertising').fadeIn(1000);
            $('#img-youtube-advertising').fadeIn(1000);
        } else if( $(window).scrollTop() < 1150 ) {
            $('#div-description-facebook').fadeOut();
            $('#h3-facebook-ads').fadeOut();
            $('#hr-facebook-ads').fadeOut();
            $('#p-facebook-ads').fadeOut();
            $('#img-facebook-ads').fadeOut();

            $('#div-description-youtube').fadeOut();
            $('#h3-youtube-advertising').fadeOut();
            $('#hr-youtube-advertising').fadeOut();
            $('#p-youtube-advertising').fadeOut();
            $('#img-youtube-advertising').fadeOut();
        }

        if( $(window).scrollTop() > 1700 ) {
            elem = $('#div-description-instagram');
            elem.fadeIn(1000);
            elem.css('display', 'grid');
            $('#h3-instagram-business').fadeIn(1000);
            $('#hr-instagram-business').fadeIn(1000);
            $('#p-instagram-business').fadeIn(1000);
            $('#img-instagram-business').fadeIn(1000);

            elem = $('#div-description-linkedin');
            elem.fadeIn(1000);
            elem.css('display', 'grid');
            $('#h3-linkedin-ads').fadeIn(1000);
            $('#hr-linkedin-ads').fadeIn(1000);
            $('#p-linkedin-ads').fadeIn(1000);
            $('#img-linkedin-ads').fadeIn(1000);
        } else if( $(window).scrollTop() < 1400 ) {
            $('#div-description-instagram').fadeOut();
            $('#h3-instagram-business').fadeOut();
            $('#hr-instagram-business').fadeOut();
            $('#p-instagram-business').fadeOut();
            $('#img-instagram-business').fadeOut();

            $('#div-description-linkedin').fadeOut();
            $('#h3-linkedin-ads').fadeOut();
            $('#hr-linkedin-ads').fadeOut();
            $('#p-linkedin-ads').fadeOut();
            $('#img-linkedin-ads').fadeOut();
        }

        if( $(window).scrollTop() > 2150 ) {
            elem = $('#div-description-google');
            elem.fadeIn(1000);
            elem.css('display', 'grid');
            $('#h3-google-ads').fadeIn(1000);
            $('#hr-google-ads').fadeIn(1000);
            $('#p-google-ads').fadeIn(1000);
            $('#img-google-ads').fadeIn(1000);

            elem = $('#div-description-email');
            elem.fadeIn(1000);
            elem.css('display', 'grid');
            $('#h3-email-marketing').fadeIn(1000);
            $('#hr-email-marketing').fadeIn(1000);
            $('#p-email-marketing').fadeIn(1000);
            $('#img-email-marketing').fadeIn(1000);
        } else if( $(window).scrollTop() < 1600 ) {
            $('#div-description-google').fadeOut();
            $('#h3-google-ads').fadeOut();
            $('#hr-google-ads').fadeOut();
            $('#p-google-ads').fadeOut();
            $('#img-google-ads').fadeOut();

            $('#div-description-email').fadeOut();
            $('#h3-email-marketing').fadeOut();
            $('#hr-email-marketing').fadeOut();
            $('#p-email-marketing').fadeOut();
            $('#img-email-marketing').fadeOut();
        }

        if( $(window).scrollTop() > 2300 ) {
            $('#input-more-info').show(700);
        } else if( $(window).scrollTop() < 1850 ) {
            $('#input-more-info').fadeOut();
        }

        if( $(window).scrollTop() > 2400 ) {
            $('#label-newsletter').fadeIn(1000);
            $('#input-email-newsletter').show(1000);
            $('#input-send-newsletter').fadeIn(1000);
        } else if( $(window).scrollTop() < 2150 ) {
            $('#label-newsletter').fadeOut();
            $('#input-email-newsletter').fadeOut();
            $('#input-send-newsletter').fadeOut();
        }

        if( $(window).scrollTop() > 2600 ) {
            $('#input-join-us').show(1000);
        } else if( $(window).scrollTop() < 2400 ) {
            $('#input-join-us').fadeOut();
        }
    });
}

/* -------- Services -------- */

function service() {

    $('#img-header-service').fadeIn(1000);
    setTimeout(() => {
        $('#h1-services').fadeIn(1000);
    }, 500);

    $(window).scroll(() => {

        if ($(window).scrollTop() > 10) {
            $('#adriz-header').addClass('reduce-adriz');
            $('#menu').addClass('reduce-menu');
            $('#gradient-header-contact').addClass('color-header');
        } else if ($(window).scrollTop() < 9) {
            $('#adriz-header').removeClass('reduce-adriz');
            $('#menu').removeClass('reduce-menu');
            $('#gradient-header-contact').removeClass('color-header');
        }

        if ($(window).scrollTop() > 200) {
            $('#h2-strategie').fadeIn(1000);
        }

        if ($(window).scrollTop() > 300) {
            $('#div-texte-strategie').show(1000);
            setTimeout(() => {
                $('#p-strategie').fadeIn(1000);
            }, 1000);
        }

        if ($(window).scrollTop() > 400) {
            $('#img-strategie').show(1000);
        } else if ($(window).scrollTop() === 0) {
            $('#img-strategie').fadeOut();
        }

        if ($(window).scrollTop() > 450) {
            $('#div-objectifs').show(1000);
            $('#p-objectifs').fadeIn(1000)
        } else if ($(window).scrollTop() === 0) {
            $('#div-objectifs').fadeOut();
            $('#p-objectifs').fadeOut();
        }

        if ($(window).scrollTop() > 500) {
            $('#div-faiblesses').show(1000);
            $('#p-faiblesses').fadeIn(1000)
        } else if ($(window).scrollTop() === 0) {
            $('#div-faiblesses').fadeOut();
            $('#p-faiblesses').fadeOut();
        }

        if ($(window).scrollTop() > 550) {
            $('#div-pack').show(1000);
            $('#p-pack').fadeIn(1000)
        } else if ($(window).scrollTop() === 0) {
            $('#div-pack').fadeOut();
            $('#p-pack').fadeOut();
        }

        if ($(window).scrollTop() > 600) {
            $('#div-amelioration').show(1000);
            $('#p-amelioration').fadeIn(1000)
        } else if ($(window).scrollTop() === 0) {
            $('#div-amelioration').fadeOut();
            $('#p-amelioration').fadeOut();
        }

        if ($(window).scrollTop() > 1000) {
            $('#p-analyse').fadeIn(1000);
            $('#input-analyse').show(1000);
        } else if ($(window).scrollTop() < 200) {
            $('#p-analyse').fadeOut();
            $('#input-analyse').fadeOut();
        }

        if ($(window).scrollTop() > 1200) {
            $('#h2-campagne').fadeIn(1000);
        } else if ($(window).scrollTop() < 750) {
            $('#h2-campagne').fadeOut();
        }

        if ($(window).scrollTop() > 1300) {
            $('#div-texte-campagne').show(1000);
            $('#p-campagne').fadeIn(2000);
        } else if ($(window).scrollTop() < 850) {
            $('#div-texte-campagne').fadeOut();
            $('#p-campagne').fadeOut();
        }

        if ($(window).scrollTop() > 1400) {
            $('#img-campagne').show(1000);
        } else if ($(window).scrollTop() < 950) {
            $('#img-campagne').fadeOut();
        }

        if ($(window).scrollTop() > 1650) {
            $('#div-segmentation').show(1000);
            $('#p-segmentation').fadeIn(1000);
        } else if ($(window).scrollTop() < 1150) {
            $('#div-segmentation').fadeOut();
            $('#p-segmentation').fadeOut();
        }

        if ($(window).scrollTop() > 1700) {
            $('#div-pub').show(1000);
            $('#p-pub').fadeIn(1000);
        } else if ($(window).scrollTop() < 1200) {
            $('#div-pub').fadeOut();
            $('#p-pub').fadeOut();
        }

        if ($(window).scrollTop() > 1750) {
            $('#div-funnel').show(1000);
            $('#p-funnel').fadeIn(1000);
        } else if ($(window).scrollTop() < 1250) {
            $('#div-funnel').fadeOut();
            $('#p-funnel').fadeOut();
        }

        if ($(window).scrollTop() > 1800) {
            $('#div-performance').show(1000);
            $('#p-performance').fadeIn(1000)
        } else if ($(window).scrollTop() < 1300) {
            $('#div-performance').fadeOut();
            $('#p-performance').fadeOut();
        }

        if ($(window).scrollTop() > 2200) {
            $('#div-inbound').show(1000);
            setTimeout(() => {
                switchInbound();
            }, 500);
        } else if ($(window).scrollTop() < 1700) {
            $('#div-inbound').fadeOut();
        }

        if ($(window).scrollTop() > 2600) {
            $('#h2-automatisation').show(1000);
        } else if ($(window).scrollTop() < 2100) {
            $('#h2-automatisation').fadeOut();
        }

        if ($(window).scrollTop() > 2700) {
            $('#div-texte-automatisation').show(1000);
            $('#p-automatisation').fadeIn(2000);
        } else if ($(window).scrollTop() < 2200) {
            $('#div-texte-automatisation').fadeOut();
            $('#p-automatisation').fadeOut();
        }

        if ($(window).scrollTop() > 3000) {
            $('#p-question').fadeIn(1000);
            $('#input-question').show(1000);
        } else if ($(window).scrollTop() < 2500) {
            $('#p-question').fadeOut();
            $('#input-question').fadeOut();
        }

    });
}

async function switchInbound() {


    if ( $('#div-inbound').css('display') === 'none' ) return
    else $('#img-inbound-1').fadeIn();
    setTimeout(() => {
        if ( $('#div-inbound').css('display') === 'none' ) return
        else $('#img-inbound-2').fadeIn();
        setTimeout(() => {
            if ( $('#div-inbound').css('display') === 'none' ) return
            else $('#img-inbound-3').fadeIn();
            setTimeout(() => {
                if ( $('#div-inbound').css('display') === 'none' ) return
                else $('#img-inbound-4').fadeIn();
                setTimeout(() => {
                    if ( $('#div-inbound').css('display') === 'none' ) return
                    else $('#img-inbound-5').fadeIn();
                    setTimeout(() => {
                        if ( $('#div-inbound').css('display') === 'none' ) return
                        else $('#img-inbound-6').fadeIn();
                        setTimeout(() => {
                            if ( $('#div-inbound').css('display') === 'none' ) return
                            else $('#img-inbound-7').fadeIn();
                            setTimeout(() => {
                                if ( $('#div-inbound').css('display') === 'none' ) return
                                else $('#img-inbound-8').fadeIn();
                                setTimeout(() => {
                                    if ( $('#div-inbound').css('display') === 'none' ) return
                                    else $('#img-inbound-9').fadeIn();
                                    setTimeout(() => {
                                        $('#img-inbound-1').fadeOut(1000);
                                        $('#img-inbound-2').fadeOut(1000);
                                        $('#img-inbound-3').fadeOut(1000);
                                        $('#img-inbound-4').fadeOut(1000);
                                        $('#img-inbound-5').fadeOut(1000);
                                        $('#img-inbound-6').fadeOut(1000);
                                        $('#img-inbound-7').fadeOut(1000);
                                        $('#img-inbound-8').fadeOut(1000);
                                        $('#img-inbound-9').fadeOut(1000);
                                        setTimeout(() => {
                                            switchInbound();
                                        }, 2000);
                                    }, 3000);
                                }, 1000);
                            }, 1000);
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    }, 1000);
}

/* -------- Agence -------- */

function agence() {

    $('#h1-titre-agence').fadeIn(1000);
    setTimeout(() => {
        $('#span-its').fadeIn(1000);
        setTimeout(() => {
            $('#span-titre-our').fadeIn(1000);
            $('#hr-titre-agence').show(1000);
            setTimeout(() => {
                $('#h1-titre-agence-1').fadeIn(1000);
                setTimeout(() => {
                    $('#span-titre-1-1').fadeIn(1000);
                }, 250);
                setTimeout(() => {
                    $('#h1-titre-agence-2').fadeIn(1000);
                    setTimeout(() => {
                        $('#span-titre-2-1').fadeIn(1000);
                    }, 250);
                    setTimeout(() => {
                        $('#h1-titre-agence-3').fadeIn(1000);
                        setTimeout(() => {
                            $('#span-titre-3-1').fadeIn(1000);
                        }, 250);
                        setTimeout(() => {
                            $('#h1-titre-agence-4').fadeIn(1000);
                            setTimeout(() => {
                                $('#span-titre-4-1').fadeIn(1000);
                            }, 250);
                            setTimeout(() => {
                                switchHeader();
                            }, 5000);
                        }, 500);
                    }, 500);
                }, 500);
            }, 500);
        }, 250);
    }, 250);

    $(window).scroll(() => {

        if ($(window).scrollTop() > 10) {
            $('#adriz-header').addClass('reduce-adriz');
            $('#menu').addClass('reduce-menu');
            $('#gradient-header-contact').addClass('color-header');
        } else if ($(window).scrollTop() < 9) {
            $('#adriz-header').removeClass('reduce-adriz');
            $('#menu').removeClass('reduce-menu');
            $('#gradient-header-contact').removeClass('color-header');
        }

        if ($(window).scrollTop() > 150) {
            $('#gif-digital').show(2000);
            $('#p-digital').fadeIn(2000);
        }

        if ($(window).scrollTop() > 350) {
            $('#div-internet').show(1000);
            $('#gif-internet').fadeIn(1000);
            $('#div-texte-internet').fadeIn(1000);
            $('#p-internet').fadeIn(1000);
        }

        if ($(window).scrollTop() > 700) {
            $('#div-texte-reseaux').fadeIn(1000);
            $('#p-reseaux').fadeIn(1000);
            $('#div-gif-reseaux').show(1000);
            $('#gif-reseaux').fadeIn(1000);
        } else if( $(window).scrollTop() === 0) {
            $('#div-texte-reseaux').fadeOut(1000);
            $('#p-reseaux').fadeOut(1000);
            $('#div-gif-reseaux').fadeOut(1000);
            $('#gif-reseaux').fadeOut(1000);
        }

        if ($(window).scrollTop() > 1150) {
            $('#div-gif-travail').show(1000);
            $('#gif-travail').fadeIn(1000);
            $('#div-texte-travail').fadeIn(1000);
            $('#p-travail').fadeIn(1000);
        } else if( $(window).scrollTop() < 500) {
            $('#div-gif-travail').fadeOut(1000);
            $('#gif-travail').fadeOut(1000);
            $('#div-texte-travail').fadeOut(1000);
            $('#p-travail').fadeOut(1000);
        }

        if ($(window).scrollTop() > 1500) {
            $('#p-revolution').fadeIn(1000);
            $('#gif-revolution').show(1000);
        } else if( $(window).scrollTop() < 900) {
            $('#p-revolution').fadeOut();
            $('#gif-revolution').fadeOut();
        }

        if ($(window).scrollTop() > 1700) {
            $('#div-gif-valeur').show(1000);
            $('#gif-valeur').fadeIn(1000);
            $('#div-texte-valeur').fadeIn(1000);
            $('#p-valeur').fadeIn(1000);
        } else if( $(window).scrollTop() < 1100) {
            $('#div-gif-valeur').fadeOut();
            $('#gif-valeur').fadeOut();
            $('#div-texte-valeur').fadeOut();
            $('#p-valeur').fadeOut();
        }

        if ($(window).scrollTop() > 2150) {
            $('#gif-adriz').fadeIn(1000);
            $('#div-texte-adriz').fadeIn(2000);
            $('#p-adriz').fadeIn(2000);
        } else if( $(window).scrollTop() < 1700) {
            $('#gif-adriz').fadeOut();
            $('#div-texte-adriz').fadeOut();
            $('#p-adriz').fadeOut();
        }

        if ($(window).scrollTop() > 2500) {
            $('#p-rejoindre').fadeIn(1000);
            $('#hr-service-adriz').show(1000);
            $('#input-rejoindre').show(1000);
        } else if( $(window).scrollTop() < 2000) {
            $('#p-rejoindre').fadeOut();
            $('#hr-service-adriz').fadeOut();
            $('#input-rejoindre').fadeOut();
        }

    });

}

async function switchHeader() {

    let titre = [];

    titre.push( $('#span-titre-our') );
    titre.push( $('#span-titre-1-1') );
    titre.push( $('#span-titre-2-1') );
    titre.push( $('#span-titre-3-1') );
    titre.push( $('#span-titre-4-1') );

    titre.push( $('#span-titre-your') );
    titre.push( $('#span-titre-1-2') );
    titre.push( $('#span-titre-2-2') );
    titre.push( $('#span-titre-3-2') );
    titre.push( $('#span-titre-4-2') );

    setTimeout(() => {

    });

    titre[0].fadeOut(1000);
    titre[1].fadeOut(1000);
    titre[2].fadeOut(1000);
    titre[3].fadeOut(1000);
    titre[4].fadeOut(1000);

    setTimeout(() => {
        titre[5].fadeIn(1000);
        titre[6].fadeIn(1000);
        titre[7].fadeIn(1000);
        titre[8].fadeIn(1000);
        titre[9].fadeIn(1000);
        setTimeout(() => {
            titre[5].fadeOut(1000);
            titre[6].fadeOut(1000);
            titre[7].fadeOut(1000);
            titre[8].fadeOut(1000);
            titre[9].fadeOut(1000);
            setTimeout(() => {
                titre[0].fadeIn(1000);
                titre[1].fadeIn(1000);
                titre[2].fadeIn(1000);
                titre[3].fadeIn(1000);
                titre[4].fadeIn(1000);
                setTimeout(() => {
                    switchHeader();
                }, 5000);
            },1000);
        }, 5000);
    }, 1000);
}

/* -------- Équipe -------- */

function equipe() {


    $("#header-creation").show(1000);
    setTimeout(() => {
        $("#h1-creation").fadeIn(1000);
        setTimeout(() => {
            $("#h2-creation").fadeIn(1000);
            setTimeout(() => {
                $("#div-rennes").show(1000);
                setTimeout(() => {
                    $("#p-rennes").fadeIn(1000);
                    $("#div-img-rennes").fadeIn(1000);
                }, 500);
            }, 500);
        }, 500);
    }, 750);

    $(window).scroll(() => {

        console.log($(window).scrollTop());

        if ($(window).scrollTop() > 10) {
            $('#adriz-header').addClass('reduce-adriz');
            $('#menu').addClass('reduce-menu');
            $('#gradient-header-contact').addClass('color-header');
        } else if ($(window).scrollTop() < 9) {
            $('#adriz-header').removeClass('reduce-adriz');
            $('#menu').removeClass('reduce-menu');
            $('#gradient-header-contact').removeClass('color-header');
        }

        if ($(window).scrollTop() > 200) {
            $('#div-etudes').show(1000, () => {
                $('#p-etudes').fadeIn(1000);
            });
        }

        if ($(window).scrollTop() > 450) {
            $('#div-confiance').show(1000, () => {
                $('#img-confiance').show(1000);
                $('#p-confiance').fadeIn(1000);
            });
        } else if ($(window).scrollTop() < 10) {
            $('#div-confiance').fadeOut();
            $('#img-confiance').fadeOut();
            $('#p-confiance').fadeOut();
        }

        if ($(window).scrollTop() > 550) {
            $('#div-competence').show(1000, () => {
                $('#p-competence').fadeIn(1000);
            });
        } else if ($(window).scrollTop() < 10) {
            $('#div-competence').fadeOut();
            $('#p-competence').fadeOut();
        }

        if ($(window).scrollTop() > 750) {
            $('#header-presentation').show(1000, () => {
                $('#h1-presentation').fadeIn(1000, () => {
                    $('#h2-presentation').fadeIn(1000);
                });
            });
        } else if ($(window).scrollTop() < 250) {
            $('#header-presentation').fadeOut();
            $('#h1-presentation').fadeOut();
            $('#h2-presentation').fadeOut();
        }

        if ($(window).scrollTop() > 1000) {
            $('#div-lucas').show(1000, () => {
                $('#h3-lucas').fadeIn(1000);
                $('#h4-lucas').fadeIn(1000);
                $('#h5-lucas').fadeIn(1000);
                $('#linkedin-lucas').show(1000);
                $('#div-img-lucas').show(1000);
            });
        } else if ($(window).scrollTop() < 400) {
            $('#div-lucas').fadeOut();
            $('#h3-lucas').fadeOut();
            $('#h4-lucas').fadeOut();
            $('#h5-lucas').fadeOut();
            $('#linkedin-lucas').fadeOut();
            $('#div-img-lucas').fadeOut();
        }

        if ($(window).scrollTop() > 1150) {
            $('#div-julien').show(1000, () => {
                $('#h3-julien').fadeIn(1000);
                $('#h4-julien').fadeIn(1000);
                $('#h5-julien').fadeIn(1000);
                $('#linkedin-julien').show(1000);
                $('#div-img-julien').show(1000);
            });
        } else if ($(window).scrollTop() < 550) {
            $('#div-julien').fadeOut();
            $('#h3-julien').fadeOut();
            $('#h4-julien').fadeOut();
            $('#h5-julien').fadeOut();
            $('#linkedin-julien').fadeOut();
            $('#div-img-julien').fadeOut();
        }

        if ($(window).scrollTop() > 1350) {
            $('#div-video-presentation').show(1000);
        } else if ($(window).scrollTop() < 750) {
            $('#div-video-presentation').fadeOut();
        }

        if ($(window).scrollTop() > 1600) {
            $('#p-contact').fadeIn(1000);
            $('#button-contact').show(1000);
        } else if ($(window).scrollTop() < 1000) {
            $('#p-contact').fadeOut();
            $('#button-contact').fadeOut();
        }

    });

}

/* -------- Contact -------- */

function contact() {

    $('h1').fadeIn(750);
    setTimeout(() => {
        $('#label-nom').fadeIn(750);
        $('#input-nom').show(750);
        setTimeout(() => {
            $('#label-prenom').fadeIn(750);
            $('#input-prenom').show(750);
            setTimeout(() => {
                $('#label-mail').fadeIn(750);
                $('#input-mail').show(750);
                setTimeout(() => {
                    $('#label-message').fadeIn(750);
                    $('#text-message').show(750);
                    setTimeout(() => {
                        $('#input-form-submit').show(750);
                    }, 250);
                }, 250);
            }, 250);
        }, 250);
    }, 250);

    $(window).scroll(() => {

        if ($(window).scrollTop() > 10) {
            $('#adriz-header').addClass('reduce-adriz');
            $('#menu').addClass('reduce-menu');
            $('#gradient-header-contact').addClass('color-header');
        } else if ($(window).scrollTop() < 9) {
            $('#adriz-header').removeClass('reduce-adriz');
            $('#menu').removeClass('reduce-menu');
            $('#gradient-header-contact').removeClass('color-header');
        }
    });
}

/* -------- Nous Rejoindre -------- */

function rejoindre() {

    $('#h1-a-venir').fadeIn(1000);
    setTimeout(() => {
        $('#p-a-venir').fadeIn(1000);
        setTimeout(() => {
            $('#label-newsletter-a-venir').fadeIn(1000);
            $('#input-email-newsletter-a-venir').show(1000);
            $('#input-send-newsletter-a-venir').show(1000);
            setTimeout(() => {
                $('#label-contact-a-venir').fadeIn(1000);
                $('#input-contact-a-venir').show(1000);
            }, 500);
        }, 500);
    }, 500);

    $(window).scroll(() => {
        if ($(window).scrollTop() > 10) {
            $('#adriz-header').addClass('reduce-adriz');
            $('#menu').addClass('reduce-menu');
            $('#gradient-header-contact').addClass('color-header');
        } else if ($(window).scrollTop() < 9) {
            $('#adriz-header').removeClass('reduce-adriz');
            $('#menu').removeClass('reduce-menu');
            $('#gradient-header-contact').removeClass('color-header');
        }
    });

}

fetch('/api/session')
    .then(res => res.json())
    .then(session => {
        sessionSet('session', session);

        // On démarre le routing
        page.base('/');
        page.start();

        setTimeout(() => {
            refreshSession();
        }, SESSION_REFRESH_TIME);

        page(window.location.pathname);
    }).catch((e) => console.log('Could not query the session ! -> ' + e));

const refreshSession = function () {
    if (sessionGet('session').success) {
        fetch('/api/session')
            .then(res => res.json())
            .then(session => {
                sessionSet('session', session);
                setTimeout(() => {
                    refreshSession();
                }, SESSION_REFRESH_TIME);
            }).catch((err) => {

                console.log('Error:', err);

                setTimeout(() => {
                    refreshSession();
                }, SESSION_REFRESH_TIME);
            });
    }
    else {
        // déconnecté, pas de refresh
    }
};
