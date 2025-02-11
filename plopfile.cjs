// plopfile.js
module.exports = function (plop) {
    // Générateur pour les composants
    plop.setGenerator('component', {
      description: 'Créer un nouveau composant avec un template et un dossier',
      prompts: [
        {
          type: 'input',
          name: 'name',
          message: 'Nom du composant (en PascalCase) :',
        },
      ],
      actions: [
        {
          type: 'add',
          path: 'src/components/{{pascalCase name}}/{{pascalCase name}}.tsx',
          templateFile: 'plop-templates/component.hbs',
        },
        {
          type: 'add',
          path: 'src/components/{{pascalCase name}}/{{pascalCase name}}.css',
          templateFile: 'plop-templates/component.css.hbs',
        }
      ],
    });

    // Générateur pour les pages
    plop.setGenerator('page', {
      description: 'Créer une nouvelle page avec un template et un dossier',
      prompts: [
        {
          type: 'input',
          name: 'name',
          message: 'Nom de la page (en PascalCase) :',
        },
      ],
      actions: [
        {
          type: 'add',
          path: 'src/pages/{{pascalCase name}}/{{pascalCase name}}.tsx', 
          templateFile: 'plop-templates/page.hbs',
        },
        {
          type: 'add',
          path: 'src/pages/{{pascalCase name}}/{{pascalCase name}}.css',
          templateFile: 'plop-templates/page.css.hbs',
        }
      ],
    });
  };
  