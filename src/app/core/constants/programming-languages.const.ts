export interface ProgrammingLanguage {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  disabled?: boolean;
}

export const PROGRAMMING_LANGUAGES: ProgrammingLanguage[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: 'assets/images/languages/javascript.svg',
    description: 'Динамический язык программирования для веб-разработки',
    color: '#F7DF1E',
    disabled: false
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    icon: 'assets/images/languages/typescript.svg',
    description: 'Надмножество JavaScript с статической типизацией',
    color: '#3178C6',
    disabled: false
  },
  {
    id: 'coming-soon',
    name: 'В разработке',
    icon: 'assets/images/languages/placeholder.svg',
    description: 'Скоро здесь появятся новые языки программирования',
    color: '#94a3b8',
    disabled: true
  }
];

