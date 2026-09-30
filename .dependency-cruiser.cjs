/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-no-react-io',
      severity: 'error',
      comment: 'domain must stay pure',
      from: { path: '^src/domain', pathNot: '\\.test\\.(ts|tsx)$' },
      to: {
        path: '^(src/(app|features|services)|node_modules/(react|@supabase|zustand))',
      },
    },
    {
      name: 'no-supabase-in-components',
      severity: 'error',
      comment: 'Components must use feature hooks, not services/supabase or lib/supabase/gemini',
      from: {
        path: '^src/features/.+/components|^src/features/student-app|^src/features/student/|^src/features/shared/',
      },
      to: {
        path: 'services/supabase|lib/supabase\\.ts|lib/gemini',
      },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.app.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
}
