'use strict';

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

page('/', async () => {
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
        let err = $('#error-interne-newsletter');
        let validation = $('#validation-newsletter');

        let SHA256 = new Hashes.SHA256;
        db.collection("newsletter").doc(SHA256.hex(email.val().toLowerCase())).set({
            email: email.val().toLowerCase()
        }).then(function () {
            email.val('');

            email.css('border', '2px solid #5269FF');
            err.css('opacity', 0);
            validation.addClass('show')
            setTimeout(() => {
                validation.removeClass('show');
            }, 3000)
        }).catch(function () {
            email.css('border', '2px solid red');
            validation.removeClass('show');
            err.css('opacity', 1);
        });

    });

    $('#input-join-us').click(() => {
        page.redirect('/nous-rejoindre');
    });

    footer();

});

/* -------- Services -------- */

page('/services', async () => {
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

    footer();

});

/* -------- Agence -------- */

page('/agence', async () => {

    await renderTemplate(templates('templates/agence.mustache'));
    window.scrollTo(0, 0);

    header();
    agence();

    $('#input-rejoindre').click(() => {
        page.redirect('/nous-rejoindre');
    });

    footer();

});

/* -------- Équipe -------- */

page('/equipe', async () => {
    await renderTemplate(templates('templates/equipe.mustache'));
    window.scrollTo(0, 0);

    header();
    equipe();

    $('#button-contact').click(() => {
        page.redirect('/contact');
    });

    footer();

});

/* -------- Contact -------- */

page('/contact', async () => {
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
        let validation = $('#validation-formulaire-contact');
        let err = $('#error-formulaire-contact');

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

                err.css('opacity', 0);
                validation.addClass('show');
                setTimeout(() => {
                    validation.removeClass('show');
                }, 3000)
            }).catch(() => {
                validation.removeClass('show');
                err.css('opacity', 1);
            });

        footer();

    });

});

/* -------- Nous Rejoindre -------- */

page('/nous-rejoindre', async () => {
    await renderTemplate(templates('templates/rejoindre.mustache'));
    window.scrollTo(0, 0);

    header();
    rejoindre();

    let email = $('#input-email-newsletter-a-venir');
    let err = $('#error-interne-newsletter-a-venir');
    let validation = $('#validation-newsletter-a-venir');

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

            err.css('opacity', 0);
            validation.addClass('show');
            setTimeout(() => {
                validation.removeClass('show');
            }, 3000);
        }).catch(() => {
            email.css('border', '2px solid red');

            validation.removeClass('show');
            err.css('opacity', 1);
        });
    });

    footer();

});

/* -------- Mentions Légales -------- */

page('/mention', async () => {

    await renderTemplate(templates('templates/mention.mustache'));
    window.scrollTo(0, 0);

    header();
    mention();
    footer();

});

/* -------- Error 404 -------- */

page('*', '/');

/* -------- Lancement de Page -------- */

page();

/* -------- FOOTER -------- */

function footer(){
    $('#adriz-footer').click(() => {
        page.redirect('/');
    });

    $('#a-mentions').click(() => {
        page.redirect('/mention');
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
