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

    accueil();
    header();

    $('#button-rejoindre-header').click( () => { page.redirect('/nous-rejoindre'); });
    $('#button-contacter-header').click( () => { page.redirect('/contact'); });
    $('#input-contact').click( () => { page.redirect('/contact'); });
    $('#input-more-info').click( () => { page.redirect('/services'); });

    $('#input-send-newsletter').click( () => {
        let email = $('#input-email-newsletter');
        const mailRegex = new RegExp(/^([\w-.]+)@((?:[\w]+\.)+)([a-zA-Z]{2,4})/i);
        console.log(email.val());
        if( email.val().match(mailRegex) ){
            // TODO : Appel API
            email.val('');
            $('#validation-newsletter').fadeIn(500);
            setTimeout(function(){
                $('#validation-newsletter').fadeOut(500);
            }, 3000);
        } else {
            $('#error-newsletter').fadeIn('slow').delay(3000).fadeOut('slow');
        }
    });

    $('#input-join-us').click( () => { page.redirect('/nous-rejoindre'); });
    $('#adriz-footer').click( () => { page.redirect('/'); });
});

page('contact', async function () {
    sessionSet('page_to_render', 'contact');
    await renderTemplate(templates('/public/templates/contact.mustache'), sessionGet('session'));

    header();
    contact();
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

    $('#div-row-2-3').click( () => { page.redirect('/'); });
    $('#div-row-4-5').click( () => { page.redirect('/services'); });
    $('#div-row-6-7').click( () => { page.redirect('/agence'); });
    $('#div-row-8-9').click( () => { page.redirect('/contact'); });
    $('#div-row-10-11').click( () => { page.redirect('/nous-rejoindre'); });

    $('#adriz-header').click( () => { page.redirect('/'); });
}

/* -------- Accueil -------- */

function accueil(){

    $('h1').fadeIn(1000);
    setTimeout(() => {
        $('#adriz-presentation').fadeIn(1000);
        setTimeout(() => {
            $('#digitale-img').show(1000);
            setTimeout(() => {
                $('#button-rejoindre-header').fadeIn(1000);
                $('#button-contacter-header').fadeIn(1000);
            }, 250);
        }, 500);
    }, 500);

    $(window).scroll(() => {

        let elem;

        if ($(window).scrollTop() > 100) {
            $('#adriz-header').addClass('reduce-adriz');
            $('#menu').addClass('reduce-menu');
            $('header').addClass('color');
        } else if ($(window).scrollTop() < 99) {
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
            $('#img-service-2').show(1000);
            elem = $('#div-description-service-2');
            elem.fadeIn(1000);
            elem.css('display', 'grid');
            $('.icon-service-2').fadeIn(1000);
            $('.p-service-2').fadeIn(1000);
        } else if( $(window).scrollTop() < 600 ) {
            $('#div-description-service-2').fadeOut();
            $('#h2-service-2').fadeOut();
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
    }).catch((err) => console.log('Could not query the session ! -> ' + err));


// Toutes les dix secondes, si l'user ne refraichit pas la page, la session est récupérée.
// Dans le cas ou la session n'est plus valide

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
