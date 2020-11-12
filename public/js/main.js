'use strict';

const firebaseConfig = {
    apiKey: "AIzaSyDujtl-LSVgD8RofYvGI85Zc2qmDr6175E",
    authDomain: "adriz-test.firebaseapp.com",
    databaseURL: "https://adriz-test.firebaseio.com",
    projectId: "adriz-test",
    storageBucket: "adriz-test.appspot.com",
    messagingSenderId: "22617378223",
    appId: "1:22617378223:web:8dd4562bc4db936a6d335a",
    measurementId: "G-BG1509NNRF"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

// fonction utilitaire permettant de faire du
// lazy loading (chargement à la demande) des templates
const templates = (() => {
    let templates = {};
    return function load(url) {
        if (templates[url]) {
            return Promise.resolve(templates[url]); // systeme de caching
        } else {
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
                menu: templates('templates/menu.mustache'),
                header_accueil: templates('templates/header-accueil.mustache'),
                header_all: templates('templates/header-all.mustache'),
                cookie: templates('templates/cookie.mustache'),
                footer: templates('templates/footer.mustache')
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

    // On rend le template
    const rendered = Mustache.render(await template, context, partials);

    // Et on l'insère dans le body
    let body = document.querySelector('body');
    body.innerHTML = rendered;

};

/********** PAGE **********/

/* -------- Accueil -------- */

page('/', async () => {

    await renderTemplate(templates('templates/accueil.mustache'));

    accueil();
    header();
    footer();

    window.scrollTo(0, 0);

    if (localStorage.getItem('cookie') == null) cookie();

    if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('screen_view');

    $('#button-rejoindre-header').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'rejoindre-header'});
        page.redirect('/nous-rejoindre');
    });
    $('#button-contacter-header').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'contact-header'});
        page.redirect('/contact');
    });
    $('#input-contact').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'contact-body'});
        page.redirect('/contact');
    });
    $('#input-more-info').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'services-body'});
        page.redirect('/services');
    });

    $('#form-newsletter').submit(e => {

        e.preventDefault();

        let email = $('#input-email-newsletter');
        let err = $('#error-interne-newsletter');
        let validation = $('#validation-newsletter');

        let SHA256 = new Hashes.SHA256;
        db.collection("newsletter").doc(SHA256.hex(email.val().toLowerCase())).set({
            email: email.val().toLowerCase()
        }).then(function () {

            if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('newsletter');

            email.val('');

            email.css('border', '2px solid #5269FF');
            err.css('opacity', 0);
            validation.addClass('show')
            setTimeout(() => {
                validation.removeClass('show');
            }, 3000)
        }).catch(function () {

            if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('exception', {action: 'newsletter'});

            email.css('border', '2px solid red');
            validation.removeClass('show');
            err.css('opacity', 1);
        });

    });

    $('#input-join-us').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'rejoindre-body'});
        page.redirect('/nous-rejoindre');
    });

});

/* -------- Services -------- */

page('/services', async () => {
    await renderTemplate(templates('templates/services.mustache'));

    header();
    service();
    footer();

    window.scrollTo(0, 0);

    if (localStorage.getItem('cookie') == null) cookie();

    if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('screen_view');

    $('#input-analyse').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'rejoindre'});
        page.redirect('/nous-rejoindre');
    });
    $('#input-question').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'contact'});
        page.redirect('/contact');
    });

});

/* -------- Agence -------- */

page('/agence', async () => {

    await renderTemplate(templates('templates/agence.mustache'));

    header();
    agence();
    footer();

    window.scrollTo(0, 0);

    if (localStorage.getItem('cookie') == null) cookie();

    if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('screen_view');

    $('#input-rejoindre').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'rejoindre'});
        page.redirect('/nous-rejoindre');
    });
});

/* -------- Équipe -------- */

page('/equipe', async () => {


    await renderTemplate(templates('templates/equipe.mustache'));

    header();
    equipe();
    footer();

    window.scrollTo(0, 0);

    if (localStorage.getItem('cookie') == null) cookie();

    if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('screen_view');

    $('#a-linkedin-lucas').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('network', {button: 'linkedin-lucas'});
        location.replace('https://www.linkedin.com/in/hervouet-lucas/');
    });

    $('#a-linkedin-julien').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('network', {button: 'linkedin-julien'});
        location.replace('https://www.linkedin.com/in/julien-waisse-4318b41b4/');
    });

    $('#button-contact').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'contact'});
        page.redirect('/contact');
    });

});

/* -------- Contact -------- */

page('/contact', async () => {

    await renderTemplate(templates('templates/contact.mustache'));

    header();
    contact();
    footer();

    window.scrollTo(0, 0);

    if (localStorage.getItem('cookie') == null) cookie();

    if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('screen_view');


    $('#form-contact').submit(e => {

        e.preventDefault();

        let nom = $('#input-nom');
        let prenom = $('#input-prenom');
        let mail = $('#input-mail');
        let message = $('#text-message');
        let validation = $('#validation-formulaire-contact');
        let err = $('#error-formulaire-contact');
        let date = new Date();

        date = ("0" + date.getDate()).slice(-2) + '/' + ("0" + (date.getMonth() + 1)).slice(-2) + '/' +
            date.getFullYear() + ' ' + ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2)
            + ':' + ("0" + date.getSeconds()).slice(-2);

        const data = {
            nom: nom.val().toLowerCase(),
            prenom: prenom.val().toLowerCase(),
            mail: mail.val().toLowerCase(),
            message: message.val().toLowerCase(),
            date: date
        };

        db.collection("contact").add(data)
            .then(() => {

                if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('contact');

                nom.val('');
                prenom.val('');
                mail.val('');
                message.val('');

                err.css('opacity', 0);
                validation.addClass('show');
                setTimeout(() => {
                    validation.removeClass('show');
                }, 3000)
            }).catch(() => {

            if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('exception', {action: 'contact'});

            validation.removeClass('show');
            err.css('opacity', 1);
        });
    });

});

/* -------- Nous Rejoindre -------- */

page('/nous-rejoindre', async () => {

    await renderTemplate(templates('templates/rejoindre.mustache'));

    header();
    rejoindre();
    footer();

    window.scrollTo(0, 0);

    if (localStorage.getItem('cookie') == null) cookie();

    if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('screen_view');

    let email = $('#input-email-newsletter-a-venir');
    let err = $('#error-interne-newsletter-a-venir');
    let validation = $('#validation-newsletter-a-venir');

    $('#input-contact-a-venir').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'contact'});
        page.redirect('/contact');
    })

    $('#form-newsletter-a-venir').submit(e => {

        e.preventDefault();

        let SHA256 = new Hashes.SHA256;
        db.collection("newsletter").doc(SHA256.hex(email.val().toLowerCase())).set({
            email: email.val().toLowerCase()
        }).then(() => {

            if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('newsletter');

            email.val('');
            email.css('border', '2px solid #5269FF');

            err.css('opacity', 0);
            validation.addClass('show');
            setTimeout(() => {
                validation.removeClass('show');
            }, 3000);
        }).catch(() => {

            if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('exception', {action: 'newsletter'});

            email.css('border', '2px solid red');

            validation.removeClass('show');
            err.css('opacity', 1);
        });
    });
});

/* -------- Mentions Légales -------- */

page('/mention', async () => {

    await renderTemplate(templates('templates/mention.mustache'));

    header();
    mention();
    footer();

    window.scrollTo(0, 0);

    if (localStorage.getItem('cookie') == null) cookie();

    if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('screen_view');

});

/* -------- Error 404 -------- */

page('*', '/');

/* -------- Lancement de Page -------- */

page();

/* -------- FOOTER -------- */

function footer() {
    $('#a-reseaux-youtube').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('network', {button: 'youtube-footer'});
        location.replace("https://www.youtube.com/");
    });
    $('#a-reseaux-facebook').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('network', {button: 'facebook-footer'});
        location.replace("https://www.facebook.com/");
    });
    $('#a-reseaux-linkedin').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('network', {button: 'linkedin-footer'});
        location.replace("https://www.linkedin.com/");
    });
    $('#a-reseaux-twitter').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('network', {button: 'twitter-footer'});
        location.replace("https://twitter.com/");
    });

    $('#footer-accueil').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'accueil-footer'});
        page.redirect('/')
    });
    $('#footer-services').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'services-footer'});
        page.redirect('/services')
    });
    $('#footer-agence').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'agence-footer'});
        page.redirect('/agence')
    });
    $('#footer-equipe').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'equipe-footer'});
        page.redirect('/equipe')
    });
    $('#footer-contact').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'contact-footer'});
        page.redirect('/contact')
    });
    $('#footer-rejoindre').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'rejoindre-footer'});
        page.redirect('/nous-rejoindre')
    });

    $('#adriz-footer').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'logo-footer'});
        page.redirect('/');
    });

    $('#a-mentions').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'mention'});
        page.redirect('/mention');
    });
}

function cookie() {

    let container = $('#div-container-cookie');

    container.css('display', 'flex');

    $('#accepte-cookie').click(() => {
        localStorage.setItem('cookie', true);

        container.css('display', 'none');
    });
    $('#plus-cookie').click(() => {

        let presentation = $('#presentation-cookie');
        let plus = $('#div-plus-cookie');

        $('#div-cookie').css('overflow-y', 'scroll');
        plus.css('visibility', 'visible');
        presentation.css('opacity', 0);
        plus.css('opacity', 1);

        $('#accepte-plus-cookie').click(() => {
            localStorage.setItem('cookie', true);
            firebase.analytics();

            $('#div-plus-cookie').css('display', 'none');
            container.css('display', 'none');
        });

        $('#refus-cookie').click(() => {
            localStorage.setItem('cookie', false);

            $('#div-plus-cookie').css('display', 'none');
            container.css('display', 'none');
        });
    });
}

/********** ANIMATIONS **********/

/* -------- Header -------- */

function header() {
    $('#menu').click(() => {
        $('#div-menu').css('width', '100%').after(() => {
            $('.span-menu').css('opacity', 1);
        });
    });

    $('#div-close-menu').click(() => {
        $('.span-menu').css('opacity', 0);
        $('#div-menu').css('width', 0);
    });

    $('#button-close-menu').click(() => {
        $('.span-menu').css('opacity', 0);
        $('#div-menu').css('width', 0);
    });

    $('#div-nav-adriz').click(() => {

        let div = $('#div-sous-menu');

        if (div.hasClass('show-sous-menu')) {
            $('.img-sous-menu').css('opacity', 0);
            $('.span-sous-menu').css('opacity', 0)
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
                $('.img-sous-menu').css('opacity', 1);
                $('.span-sous-menu').css('opacity', 1);
            }, 200)
        }
    });

    $('#div-nav-accueil').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'accueil-header'});
        page.redirect('/');
    });
    $('#div-nav-services').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'services-header'});
        page.redirect('/services');
    });
    $('#div-nav-agence').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'agence-header'});
        page.redirect('/agence');
    });
    $('#div-nav-equipe').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'equipe-header'});
        page.redirect('/equipe');
    });
    $('#div-nav-contact').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'contact-header'});
        page.redirect('/contact');
    });
    $('#div-nav-rejoindre').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'rejoindre-header'});
        page.redirect('/nous-rejoindre');
    });

    $('#nav-accueil').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'accueil-header'});
        page.redirect('/');
    });
    $('#nav-services').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'services-header'});
        page.redirect('/services');
    });
    $('#div-span-agence').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'agence-header'});
        page.redirect('/agence');
    });
    $('#div-span-equipe').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'equipe-header'});
        page.redirect('/equipe');
    });
    $('#nav-contact').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'contact-header'});
        page.redirect('/contact');
    });
    $('#nav-rejoindre').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'rejoindre-header'});
        page.redirect('/nous-rejoindre');
    });

    $('#adriz-header').click(() => {
        if (localStorage.getItem('cookie') === 'true') firebase.analytics().logEvent('click', {button: 'logo-header'});
        page.redirect('/');
    });
}

function scrollHeader() {
    $(window).scroll(() => {
        if ($(window).scrollTop() > 10) {
            $('#adriz-header').addClass('reduce-adriz');
            $('#menu').addClass('reduce-menu');
            $('#gradient-header-contact').addClass('color-header');
            $('#nav-sous-adriz').addClass('margin');
        } else if ($(window).scrollTop() < 9) {
            $('#adriz-header').removeClass('reduce-adriz');
            $('#menu').removeClass('reduce-menu');
            $('#gradient-header-contact').removeClass('color-header');
            $('#nav-sous-adriz').removeClass('margin');
        }
    });
}

/* -------- Accueil -------- */

function accueil() {

    $('#h1-accueil').css('opacity', 1);
    setTimeout(() => {
        $('#adriz-presentation').css('opacity', 1);
        setTimeout(() => {
            $('#digital-img').css('opacity', 1);
            setTimeout(() => {
                $('#button-rejoindre-header').css('opacity', 1);
                $('#button-contacter-header').css('opacity', 1);
                setTimeout(() => {
                    $('#smma-definition').css('opacity', 1);
                    $('#smma-role').css('opacity', 1);
                }, 500);
            }, 250);
        }, 500);
    }, 500);

    $(window).scroll(() => {
        if ($(window).scrollTop() > 10) {
            $('#adriz-header').addClass('reduce-adriz');
            $('#menu').addClass('reduce-menu');
            $('header').addClass('color');
            $('#nav-sous-adriz').addClass('margin');
        } else if ($(window).scrollTop() < 9) {
            $('#adriz-header').removeClass('reduce-adriz');
            $('#menu').removeClass('reduce-menu');
            $('header').removeClass('color');
            $('#nav-sous-adriz').removeClass('margin');
        }
    });
}

/* -------- Services -------- */

function service() {
    setTimeout(() => {
        $('#h1-services').css('opacity', 1);
    }, 500);

    scrollHeader();
}

/* -------- Agence -------- */

function agence() {

    $('#h1-titre-agence').css('opacity', 1);
    setTimeout(() => {
        $('#span-its').css('opacity', 1);
        setTimeout(() => {
            $('#span-titre-our').css('opacity', 1);
            $('#hr-titre-agence').css('opacity', 1);
            setTimeout(() => {
                $('#h1-titre-agence-1').css('opacity', 1);
                setTimeout(() => {
                    $('#span-titre-1-1').css('opacity', 1);
                }, 250);
                setTimeout(() => {
                    $('#h1-titre-agence-2').css('opacity', 1);
                    setTimeout(() => {
                        $('#span-titre-2-1').css('opacity', 1);
                    }, 250);
                    setTimeout(() => {
                        $('#h1-titre-agence-3').css('opacity', 1);
                        setTimeout(() => {
                            $('#span-titre-3-1').css('opacity', 1);
                        }, 250);
                        setTimeout(() => {
                            $('#h1-titre-agence-4').css('opacity', 1);
                            setTimeout(() => {
                                $('#span-titre-4-1').css('opacity', 1);
                            }, 250);
                            setTimeout(() => {
                                $('.span-sous-titre-1').addClass('animation1');
                                $('#span-titre-our').addClass('animation1')
                                $('.span-sous-titre-2').addClass('animation2');
                                $('#span-titre-your').addClass('animation2')
                            }, 3000);
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 500);
    }, 500);

    scrollHeader();

}

/* -------- Équipe -------- */

function equipe() {

    setTimeout(() => {
        $("#h1-creation").css('opacity', 1);
        setTimeout(() => {
            $("#h2-creation").css('opacity', 1);
        }, 500);
    }, 750);

    scrollHeader();
}

/* -------- Contact -------- */

function contact() {
    scrollHeader();
}

/* -------- Nous Rejoindre -------- */

function rejoindre() {
    scrollHeader();
}

/* -------- Mentions Légales -------- */

function mention() {
    scrollHeader();
}
