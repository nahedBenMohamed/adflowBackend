interface DefaultItem {
  name: string;
  link: string;
  sortOrder: number;
}
interface DefaultGroup {
  name: string;
  sortOrder: number;
  items: DefaultItem[];
}

export const DefaultTutorial: Record<string, DefaultGroup[]> = {
  ru: [
    {
      name: 'Видеоуроки по модулям и функциям',
      sortOrder: 0,
      items: [
        {
          name: 'Обзор функционала воронки продаж',
          link: 'https://rutube.ru/video/7866956dff4e26e1c898c1a31450b3ff',
          sortOrder: 0,
        },
        {
          name: 'Как работать в сделке',
          link: 'https://rutube.ru/video/1fc6c8cf6306c32f7775dc91b557fe6b',
          sortOrder: 1,
        },
        {
          name: 'Как добавить товар/услугу в сделку',
          link: 'https://rutube.ru/video/55cfc3a2a8fe8d891cab17135d6d758a',
          sortOrder: 2,
        },
        {
          name: 'Как работать в разделе задачах',
          link: 'https://rutube.ru/video/76111a083b5579cb8c7e3e3fb6b225f8',
          sortOrder: 3,
        },
        {
          name: 'Как пользоваться Дашбордом',
          link: 'https://rutube.ru/video/d0b6ff03e0005f31236d8fa1d31a942d',
          sortOrder: 4,
        },
        {
          name: 'Как пользоваться отчетами',
          link: 'https://rutube.ru/video/c5a7cfbeda45bd110f0cba20bcc399ac',
          sortOrder: 5,
        },
        {
          name: 'Как работать с товарами и услугами',
          link: 'https://rutube.ru/video/286a3a8bd132332648bb7a37e313943c',
          sortOrder: 6,
        },
        {
          name: 'Как работать с проектами и задачами',
          link: 'https://rutube.ru/video/2384f907194a481a9d88486d85772496',
          sortOrder: 7,
        },
        {
          name: 'Как настроить уведомления',
          link: 'https://rutube.ru/video/861b2a529cf2fb93109df88e55458be2',
          sortOrder: 8,
        },
        {
          name: 'Как настроить свой профиль',
          link: 'https://rutube.ru/video/e2b52a8139e7da53fd280c1e37694e04',
          sortOrder: 9,
        },
      ],
    },
    {
      name: 'Видеоуроки по настройке и кастомизации',
      sortOrder: 1,
      items: [
        {
          name: 'Как настроить план продаж в CRM',
          link: 'https://rutube.ru/video/39a6b69a7042b6318a22eeedc08cdf51',
          sortOrder: 0,
        },
        {
          name: 'Как настроить воронку продаж',
          link: 'https://rutube.ru/video/d6c71e34f6ff41463616f3884d1e0b7a',
          sortOrder: 1,
        },
        {
          name: 'Как настроить базу знаний',
          link: 'https://rutube.ru/video/58c01491d9b6391eb5e59f19d58e47c5',
          sortOrder: 2,
        },
        {
          name: 'Как добавить и настроить права пользователю',
          link: 'https://rutube.ru/video/d0a83e46fa070e0c763d916ec4d7f9fd',
          sortOrder: 3,
        },
        {
          name: 'Продвинутые настройки полей в карточке',
          link: 'https://rutube.ru/video/203a6cea52d5935c4503f2632373b87b',
          sortOrder: 4,
        },
        {
          name: `Как настроить раздел "Товары, остатки и услуги"`,
          link: 'https://rutube.ru/video/dedae77a65ded0aa531f8c5c90075f45',
          sortOrder: 5,
        },
      ],
    },
  ],
  en: [
    {
      name: 'Video Tutorials on Modules and Functionality',
      sortOrder: 0,
      items: [
        { name: 'Project and Task Management in Amwork', link: 'https://youtu.be/23QxzqJEvKo', sortOrder: 0 },
        { name: 'Task Management and Board Types in Amwork', link: 'https://youtu.be/vCDBNbvmDnQ', sortOrder: 1 },
        { name: 'Sales Pipeline and List View in Amwork', link: 'https://youtu.be/Ptc2hGY5swo', sortOrder: 2 },
        {
          name: 'Reviewing the CRM Section and Sales Pipeline in Amwork',
          link: 'https://youtu.be/kN-yTmBc-7c',
          sortOrder: 3,
        },
        { name: 'Reviewing Deal Cards in Amwork', link: 'https://youtu.be/24HgmAyuTjk', sortOrder: 4 },
        {
          name: 'Dashboard and Sales Plan Configuration in Amwork',
          link: 'https://youtu.be/2S7PhICbzzU',
          sortOrder: 5,
        },
        {
          name: 'Harnessing the Power of Reports in CRM Section in Amwork',
          link: 'https://youtu.be/i6puY7ZZ9Ms',
          sortOrder: 6,
        },
        {
          name: 'Overview of the "Warehouse & Product Management" Section in Amwork',
          link: 'https://youtu.be/-OiDVZ3nFTI',
          sortOrder: 7,
        },
        { name: 'Creating Orders in Deal Cards in Amwork', link: 'https://youtu.be/86mGKesNytM', sortOrder: 8 },
      ],
    },
    {
      name: 'Video Tutorials on Setup and Customization',
      sortOrder: 1,
      items: [
        { name: 'Configuring a Sales Pipeline in Amwork', link: 'https://youtu.be/JXHUx7zSA-A', sortOrder: 0 },
        {
          name: 'Customizing Fields for Deal and Project Cards in Amwork',
          link: 'https://youtu.be/wb3PuZfMFP0',
          sortOrder: 1,
        },
        {
          name: 'Setting Up Automations in Boards and Sales Pipelines in Amwork',
          link: 'https://youtu.be/DDJlekyDJBY',
          sortOrder: 2,
        },
      ],
    },
  ],
};
