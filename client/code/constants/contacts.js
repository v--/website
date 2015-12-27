import Contact from 'code/helpers/contact';

export const NAME = 'Ianis G. Vasilev',
             EMAIL = 'mail@ivasilev.net',
             MAILTO = `mailto:"${NAME}" <${EMAIL}>`,
             GITHUB = 'https://github.com/v--',
             DEVIANTART = 'http://ianisvasilev.deviantart.com',
             LINKEDIN = 'https://bg.linkedin.com/in/ianisvasilev',
             FACEBOOK = 'https://www.facebook.com/ianis.vasilev',

             CONTACTS = [
                 new Contact('Email', 'envelope', MAILTO),
                 new Contact('GitHub', 'github', GITHUB),
                 new Contact('DeviantArt', 'deviantart', DEVIANTART),
                 new Contact('LinkedIn', 'linkedin', LINKEDIN),
                 new Contact('Facebook', 'facebook-square', FACEBOOK)
             ];

