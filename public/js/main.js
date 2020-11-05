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
firebase.analytics();

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

page('/', async function () {
    await renderTemplate(templates('templates/accueil.mustache'));
    window.scrollTo(0, 0);

    accueil();
    header();

    $('#button-rejoindre-header').click(() => {
        page.redirect('/nous-rejoindre');
    });
    $('#button-contacter-header').click(() => {
        page.redirect('/contact');
    });
    $('#input-contact').click(() => {
        page.redirect('/contact');
    });
    $('#input-more-info').click(() => {
        page.redirect('/services');
    });

    $('#form-newsletter').submit( e => {

        e.preventDefault();

        let email = $('#input-email-newsletter');

        let SHA256 = new Hashes.SHA256;
        db.collection("newsletter").doc(SHA256.hex(email.val().toLowerCase())).set({
            email: email.val().toLowerCase()
        }).then(function () {
            email.val('');
            email.css('border', '2px solid #5269FF');

            $('#error-interne-newsletter').fadeOut(500);
            $('#validation-newsletter').fadeIn(500).delay(3000).fadeOut(500);
        }).catch(function (e) {
            console.log(e);

            email.css('border', '2px solid red');

            $('#validation-newsletter').fadeOut(500);
            $('#error-interne-newsletter').fadeIn(500);
        });

    });

    $('#input-join-us').click(() => {
        page.redirect('/nous-rejoindre');
    });
    $('#adriz-footer').click(() => {
        page.redirect('/');
    });
});

/* -------- Services -------- */

page('services', async function () {
    await renderTemplate(templates('templates/services.mustache'));
    window.scrollTo(0, 0);

    header();
    service();

    $('#input-analyse').click(() => {
        page.redirect('/nous-rejoindre');
    });
    $('#input-question').click(() => {
        page.redirect('/contact');
    });


});

/* -------- Agence -------- */

page('agence', async function () {

    await renderTemplate(templates('templates/agence.mustache'));
    window.scrollTo(0, 0);

    header();
    agence();

    $('#input-rejoindre').click(() => {
        page.redirect('/nous-rejoindre');
    });

});

/* -------- Équipe -------- */

page('equipe', async function () {
    await renderTemplate(templates('templates/equipe.mustache'));
    window.scrollTo(0, 0);

    header();
    equipe();

    $('#button-contact').click(() => {
        page.redirect('/contact');
    });
});

/* -------- Contact -------- */

page('contact', async function () {
    await renderTemplate(templates('templates/contact.mustache'));
    window.scrollTo(0, 0);

    header();
    contact();

    $('#form-contact').submit( e => {

        e.preventDefault();

        let nom = $('#input-nom');
        let prenom = $('#input-prenom');
        let mail = $('#input-mail');
        let message = $('#text-message');

        const data = {
            nom: nom.val().toLowerCase(),
            prenom: prenom.val().toLowerCase(),
            mail: mail.val().toLowerCase(),
            message: message.val().toLowerCase()
        };

        let SHA256 = new Hashes.SHA256;
        db.collection("contact").doc(SHA256.hex(data.mail)).set(data)
            .then(() => {
                nom.val('');
                prenom.val('');
                mail.val('');
                message.val('');

                $('#error-formulaire-contact').fadeOut(500);
                $('#validation-formulaire-contact').fadeIn(500).delay(3000).fadeOut(500);
            }).catch(() => {
                $('#validation-formulaire-contact').fadeOut(500);
                $('#error-formulaire-contact').fadeIn(500);
            });

    });

});

/* -------- Contact -------- */

page('nous-rejoindre', async function () {
    await renderTemplate(templates('templates/rejoindre.mustache'));
    window.scrollTo(0, 0);

    header();
    rejoindre();

    let email = $('#input-email-newsletter-a-venir');

    $('#input-contact-a-venir').click(() => {
        page.redirect('/contact');
    })

    $('#form-newsletter-a-venir').submit( e => {

        e.preventDefault();

        let SHA256 = new Hashes.SHA256;
        db.collection("newsletter").doc(SHA256.hex(email.val().toLowerCase())).set({
            email: email.val().toLowerCase()
        }).then(() => {
            email.val('');
            email.css('border', '2px solid #5269FF');

            $('#error-interne-newsletter-a-venir').fadeOut(500);
            $('#validation-newsletter-a-venir').fadeIn(500).delay(3000).fadeOut(500);
        }).catch(() => {
            email.css('border', '2px solid red');

            $('#validation-newsletter-a-venir').fadeOut(500);
            $('#error-interne-newsletter-a-venir').fadeIn(500);
        });
    });
});

/********** ANIMATIONS **********/

/* -------- Header -------- */

function header() {
    $('#menu').click(() => {
        $('#div-menu').css('width', '100%').after(() => {
            $('.span-menu').fadeIn(500);
        });
    });

    $('#div-close-menu').click(() => {
        $('.span-menu').hide();
        $('#div-menu').css('width', '0');
    });

    $('#button-close-menu').click(() => {
        $('.span-menu').hide();
        $('#div-menu').css('width', '0');
    });

    $('#div-nav-adriz').click(() => {

        let div = $('#div-sous-menu');

        if (div.hasClass('show-sous-menu')) {
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

    $('#div-nav-accueil').click(() => {
        page.redirect('/');
    });
    $('#div-nav-services').click(() => {
        page.redirect('/services');
    });
    $('#div-nav-agence').click(() => {
        page.redirect('/agence');
    });
    $('#div-nav-equipe').click(() => {
        page.redirect('/equipe');
    });
    $('#div-nav-contact').click(() => {
        page.redirect('/contact');
    });
    $('#div-nav-rejoindre').click(() => {
        page.redirect('/nous-rejoindre');
    });

    $('#nav-accueil').click(() => {
        page.redirect('/');
    });
    $('#nav-services').click(() => {
        page.redirect('/services');
    });
    $('#div-span-agence').click(() => {
        page.redirect('/agence');
    });
    $('#div-span-equipe').click(() => {
        page.redirect('/equipe');
    });
    $('#nav-contact').click(() => {
        page.redirect('/contact');
    });
    $('#nav-rejoindre').click(() => {
        page.redirect('/nous-rejoindre');
    });

    $('#adriz-header').click(() => {
        page.redirect('/');
    });
}

/* -------- Accueil -------- */

function accueil() {

    $('h1').fadeIn(1000);
    setTimeout(() => {
        $('#adriz-presentation').fadeIn(1000);
        setTimeout(() => {
            $('#digital-img').show(1000);
            setTimeout(() => {
                $('#button-rejoindre-header').fadeIn(1000);
                $('#button-contacter-header').fadeIn(1000);
                setTimeout(() => {
                    $('#smma-definition').fadeIn(1000);
                    $('#smma-role').fadeIn(1000);
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
        $('#h1-services').fadeIn(1000);
    }, 500);

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

async function switchInbound() {


    if ($('#div-inbound').css('display') === 'none') return
    else $('#img-inbound-1').fadeIn();
    setTimeout(() => {
        if ($('#div-inbound').css('display') === 'none') return
        else $('#img-inbound-2').fadeIn();
        setTimeout(() => {
            if ($('#div-inbound').css('display') === 'none') return
            else $('#img-inbound-3').fadeIn();
            setTimeout(() => {
                if ($('#div-inbound').css('display') === 'none') return
                else $('#img-inbound-4').fadeIn();
                setTimeout(() => {
                    if ($('#div-inbound').css('display') === 'none') return
                    else $('#img-inbound-5').fadeIn();
                    setTimeout(() => {
                        if ($('#div-inbound').css('display') === 'none') return
                        else $('#img-inbound-6').fadeIn();
                        setTimeout(() => {
                            if ($('#div-inbound').css('display') === 'none') return
                            else $('#img-inbound-7').fadeIn();
                            setTimeout(() => {
                                if ($('#div-inbound').css('display') === 'none') return
                                else $('#img-inbound-8').fadeIn();
                                setTimeout(() => {
                                    if ($('#div-inbound').css('display') === 'none') return
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
            $('#nav-sous-adriz').addClass('margin');
        } else if ($(window).scrollTop() < 9) {
            $('#adriz-header').removeClass('reduce-adriz');
            $('#menu').removeClass('reduce-menu');
            $('#gradient-header-contact').removeClass('color-header');
            $('#nav-sous-adriz').removeClass('margin');
        }

    });

}

async function switchHeader() {

    let titre = [];

    titre.push($('#span-titre-our'));
    titre.push($('#span-titre-1-1'));
    titre.push($('#span-titre-2-1'));
    titre.push($('#span-titre-3-1'));
    titre.push($('#span-titre-4-1'));

    titre.push($('#span-titre-your'));
    titre.push($('#span-titre-1-2'));
    titre.push($('#span-titre-2-2'));
    titre.push($('#span-titre-3-2'));
    titre.push($('#span-titre-4-2'));

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
            }, 1000);
        }, 5000);
    }, 1000);
}

/* -------- Équipe -------- */

function equipe() {


    setTimeout(() => {
        $("#h1-creation").fadeIn(1000);
        setTimeout(() => {
            $("#h2-creation").fadeIn(1000);
        }, 500);
    }, 750);

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

/* -------- Contact -------- */

function contact() {

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

/* -------- Nous Rejoindre -------- */

function rejoindre() {

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

page.base('/');
page.start();
