/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-no-react-io',
      severity: 'error',
      comment: 'domain must stay pure',
      from: { path: '^src/domain' },
      to: {
        path: '^(src/(app|features|services)|node_modules/(react|@supabase|zustand))',
      },
    },
    {
      name: 'no-supabase-in-components',
      severity: 'warn',
      comment: 'Phase 3 tightens to error; components should use hooks',
      from: { path: '^src/features/.+/components|^src/features/student-app' },
      to: { path: 'supabase|lib/supabase|lib/gemini' },
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
