// Commitlint configuration to enforce conventional commit messages
export default {
  // Extend the conventional commit configuration provided by @commitlint/config-conventional
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'ticket-header': ({ header }) => [
          /^[a-z]+: \S(?:.*\S)?$/.test(header ?? ''),
          'header must follow "type: subject"',
        ],
      },
    },
  ],
  // Define custom rules for commit messages
  rules: {
    // Enforce that the commit type must be one of the specified values
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'maintenance', 'test', 'revert', 'chore'],
    ],
    // Enforce that the commit message must have a subject
    'subject-empty': [2, 'never'], // Disallow empty commit message subjects
    'ticket-header': [2, 'always'],
  },
};

/*  
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]
✖   header must follow "type: subject" [ticket-header]
*/
