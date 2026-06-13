import { KbCategory } from './types';

/**
 * Пошаговые гайды настройки «с нуля»: выбор ОС, поднятие Linux-сервера,
 * веб-сервер, Docker, VPN, и настройка MikroTik (RouterOS).
 * Команды даны для копирования; правьте адреса/имена под себя.
 */
export const guides: KbCategory[] = [
  // ───────────────────────── СЕРВЕРЫ ─────────────────────────
  {
    id: 'guide-server',
    title: 'Гайды: серверы',
    icon: 'server',
    color: '#34d399',
    roles: ['net'],
    articles: [
      {
        id: 'g-os-choice',
        title: 'Какую ОС выбрать для сервера',
        summary: 'Сравнение и рекомендация.',
        tags: ['ос', 'сервер', 'ubuntu', 'debian', 'выбор', 'windows server'],
        sections: [
          {
            heading: 'Сравнение',
            table: {
              headers: ['ОС', 'Для чего'],
              rows: [
                ['Ubuntu Server LTS', 'Универсал, много гайдов — выбор по умолчанию'],
                ['Debian', 'Максимальная стабильность, без лишнего'],
                ['Rocky / AlmaLinux', 'Замена CentOS, корпоративный RHEL-мир'],
                ['Proxmox VE', 'Гипервизор: много VM/контейнеров на одном железе'],
                ['Windows Server', 'AD, 1С, .NET, RDS, MS SQL'],
              ],
            },
            note: 'Новичку и большинству задач — Ubuntu Server LTS (долгая поддержка ~5 лет). Дальше команды для него.',
          },
          {
            heading: 'Железо/ресурсы (ориентир)',
            bullets: [
              'Минимум для Linux-сервера: 1–2 CPU, 2–4 ГБ RAM, SSD.',
              'Веб + база: 2–4 CPU, 4–8 ГБ RAM.',
              'Виртуализация (Proxmox): чем больше RAM и ядер, тем лучше; диски в RAID.',
            ],
          },
        ],
      },
      {
        id: 'g-ubuntu-setup',
        title: 'Поднять Ubuntu Server с нуля',
        summary: 'Установка, обновление, пользователь, SSH, firewall.',
        tags: ['ubuntu', 'установка', 'настройка', 'apt', 'ssh', 'ufw', 'сервер'],
        sections: [
          {
            heading: '1. Установка',
            bullets: [
              'Скачай Ubuntu Server LTS с ubuntu.com.',
              'Запиши на USB: Rufus/balenaEtcher (Windows) или dd (Linux).',
              'При установке отметь «Install OpenSSH server».',
              'Создай первого пользователя и задай имя сервера.',
            ],
          },
          {
            heading: '2. Первичная настройка',
            table: {
              headers: ['Команда', 'Что делает'],
              rows: [
                ['sudo apt update && sudo apt upgrade -y', 'Обновить систему'],
                ['sudo hostnamectl set-hostname srv1', 'Задать имя хоста'],
                ['sudo timedatectl set-timezone Asia/Tashkent', 'Часовой пояс'],
                ['sudo adduser admin', 'Создать пользователя'],
                ['sudo usermod -aG sudo admin', 'Дать права администратора'],
              ],
            },
          },
          {
            heading: '3. SSH по ключу (безопасно)',
            bullets: [
              'На своём ПК: ssh-keygen -t ed25519',
              'Скопировать ключ: ssh-copy-id admin@IP_сервера',
              'Проверить вход: ssh admin@IP_сервера',
              'В /etc/ssh/sshd_config: PermitRootLogin no и PasswordAuthentication no',
              'Применить: sudo systemctl restart ssh',
            ],
            note: 'Сначала убедись, что вход по ключу работает, и только потом отключай пароль — иначе закроешь себе доступ.',
          },
          {
            heading: '4. Защита',
            table: {
              headers: ['Команда', 'Что делает'],
              rows: [
                ['sudo ufw allow OpenSSH', 'Разрешить SSH'],
                ['sudo ufw enable', 'Включить firewall'],
                ['sudo apt install fail2ban -y', 'Бан перебора паролей'],
                ['sudo apt install unattended-upgrades -y', 'Автообновления безопасности'],
              ],
            },
          },
        ],
      },
      {
        id: 'g-debian-setup',
        title: 'Debian Server с нуля',
        summary: 'Отличия от Ubuntu: sudo, ufw, root.',
        tags: ['debian', 'установка', 'apt', 'sudo', 'сервер'],
        sections: [
          {
            heading: 'Что иначе по сравнению с Ubuntu',
            bullets: [
              'У Debian при установке задаётся пароль root отдельно.',
              'sudo может быть не установлен: su -, затем apt install sudo.',
              'Дать права: usermod -aG sudo admin (перелогиниться).',
              'ufw не стоит по умолчанию: apt install ufw.',
            ],
          },
          {
            heading: 'Команды (от root или через sudo)',
            table: {
              headers: ['Команда', 'Что делает'],
              rows: [
                ['apt update && apt upgrade -y', 'Обновить систему'],
                ['apt install sudo ufw fail2ban -y', 'Базовые пакеты'],
                ['hostnamectl set-hostname srv1', 'Имя хоста'],
                ['systemctl restart ssh', 'Перезапуск SSH после правок'],
                ['ufw allow OpenSSH && ufw enable', 'Firewall'],
              ],
            },
            note: 'Дальше всё как в гайде по Ubuntu (SSH-ключи, статический IP, сервисы) — пакеты те же (apt).',
          },
        ],
      },
      {
        id: 'g-rhel-setup',
        title: 'Rocky / AlmaLinux (RHEL) с нуля',
        summary: 'dnf, firewalld, wheel, SELinux.',
        tags: ['rocky', 'almalinux', 'rhel', 'centos', 'dnf', 'firewalld', 'selinux'],
        sections: [
          {
            heading: 'Первичная настройка',
            table: {
              headers: ['Команда', 'Что делает'],
              rows: [
                ['sudo dnf update -y', 'Обновить систему'],
                ['sudo hostnamectl set-hostname srv1', 'Имя хоста'],
                ['sudo timedatectl set-timezone Asia/Tashkent', 'Часовой пояс'],
                ['sudo useradd -m -G wheel admin', 'Пользователь с правами (wheel = sudo)'],
                ['sudo passwd admin', 'Задать пароль'],
              ],
            },
          },
          {
            heading: 'Firewall (firewalld) и пакеты',
            table: {
              headers: ['Команда', 'Что делает'],
              rows: [
                ['sudo firewall-cmd --add-service=ssh --permanent', 'Разрешить SSH'],
                ['sudo firewall-cmd --add-port=80/tcp --permanent', 'Открыть порт 80'],
                ['sudo firewall-cmd --reload', 'Применить правила'],
                ['sudo dnf install nginx -y', 'Поставить пакет'],
                ['sudo systemctl enable --now nginx', 'Запуск и автозапуск'],
              ],
            },
            note: 'SELinux включён по умолчанию: getenforce покажет статус. Не отключай бездумно — настраивай контексты/булины. Временно: sudo setenforce 0.',
          },
        ],
      },
      {
        id: 'g-winserver-setup',
        title: 'Windows Server с нуля',
        summary: 'sconfig, статический IP, RDP, роли, AD.',
        tags: ['windows server', 'sconfig', 'rdp', 'active directory', 'роли', 'powershell'],
        sections: [
          {
            heading: '1. Первичная настройка',
            bullets: [
              'После установки откроется sconfig (или Server Manager) — базовые настройки из меню.',
              'Имя: Rename-Computer -NewName SRV1 -Restart (PowerShell).',
              'Обновления: sconfig → пункт 6, или Settings → Windows Update.',
              'Часовой пояс и язык — через Settings.',
            ],
          },
          {
            heading: '2. Статический IP и RDP',
            table: {
              headers: ['Действие', 'Как'],
              rows: [
                ['Статический IP', 'sconfig → 8, или New-NetIPAddress (PowerShell)'],
                ['DNS', 'Set-DnsClientServerAddress -ServerAddresses 192.168.1.1'],
                ['Включить RDP', 'sconfig → 7 (Remote Desktop)'],
                ['Проверить порт', 'Test-NetConnection SRV1 -Port 3389'],
              ],
            },
          },
          {
            heading: '3. Роли (Server Manager / PowerShell)',
            table: {
              headers: ['Команда PowerShell', 'Что ставит'],
              rows: [
                ['Install-WindowsFeature AD-Domain-Services -IncludeManagementTools', 'Active Directory'],
                ['Install-ADDSForest -DomainName corp.local', 'Поднять домен (новый лес)'],
                ['Install-WindowsFeature DHCP -IncludeManagementTools', 'DHCP-сервер'],
                ['Install-WindowsFeature Web-Server', 'IIS (веб-сервер)'],
              ],
            },
            note: 'Контроллер домена должен иметь статический IP и сам себя в DNS. Клиенты домена указывают DNS на DC.',
          },
        ],
      },
      {
        id: 'g-proxmox-setup',
        title: 'Proxmox VE: виртуализация',
        summary: 'Гипервизор: VM и контейнеры на одном железе.',
        tags: ['proxmox', 'виртуализация', 'vm', 'lxc', 'гипервизор'],
        sections: [
          {
            heading: 'Установка и доступ',
            bullets: [
              'Запиши ISO Proxmox VE на USB, установи на сервер (на базе Debian).',
              'Зайди в веб-панель: https://IP_сервера:8006 (логин root).',
              'Сеть по умолчанию — мост vmbr0 (через него ходят VM).',
            ],
          },
          {
            heading: 'Создание машин',
            bullets: [
              'Загрузи ISO гостевой ОС в local storage → Create VM.',
              'Контейнер LXC: скачай шаблон (CT Templates) → Create CT (легче и быстрее VM).',
              'Снапшоты и бэкапы — встроены (Backup/Snapshots в панели).',
            ],
            note: 'Без платной подписки переключи репозиторий на «no-subscription», иначе apt update будет ругаться.',
          },
        ],
      },
      {
        id: 'g-static-ip',
        title: 'Статический IP (netplan)',
        summary: 'Фиксированный адрес для сервера.',
        tags: ['статический ip', 'netplan', 'ip', 'ubuntu', 'сеть'],
        sections: [
          {
            heading: 'Файл /etc/netplan/00-installer-config.yaml',
            body: [
              'network:',
              '  version: 2',
              '  ethernets:',
              '    eth0:',
              '      dhcp4: no',
              '      addresses: [192.168.1.10/24]',
              '      routes:',
              '        - to: default',
              '          via: 192.168.1.1',
              '      nameservers:',
              '        addresses: [1.1.1.1, 8.8.8.8]',
            ],
            note: 'Имя интерфейса узнай через ip a (часто eth0 или ens18). Отступы (пробелы) в YAML важны!',
          },
          {
            heading: 'Применить',
            bullets: ['sudo netplan apply', 'Проверить: ip a и ip r'],
          },
        ],
      },
      {
        id: 'g-nginx',
        title: 'Веб-сервер: nginx + HTTPS',
        summary: 'Поставить сайт и бесплатный сертификат.',
        tags: ['nginx', 'веб', 'сайт', 'certbot', 'https', 'letsencrypt'],
        sections: [
          {
            heading: 'Установка',
            table: {
              headers: ['Команда', 'Что делает'],
              rows: [
                ['sudo apt install nginx -y', 'Установить nginx'],
                ["sudo ufw allow 'Nginx Full'", 'Открыть 80 и 443'],
                ['sudo systemctl enable --now nginx', 'Запуск и автозапуск'],
                ['sudo nginx -t', 'Проверить конфиг'],
                ['sudo systemctl reload nginx', 'Применить изменения'],
              ],
            },
            note: 'Файлы сайта — в /var/www/. Конфиги сайтов — /etc/nginx/sites-available + симлинк в sites-enabled.',
          },
          {
            heading: 'Бесплатный HTTPS (Let’s Encrypt)',
            bullets: [
              'sudo apt install certbot python3-certbot-nginx -y',
              'sudo certbot --nginx -d example.com -d www.example.com',
              'Автопродление проверится само (systemd timer). Тест: sudo certbot renew --dry-run',
              'Нужны: домен, направленный A-записью на ваш IP, и открытые порты 80/443.',
            ],
          },
        ],
      },
      {
        id: 'g-docker',
        title: 'Docker: установка и запуск',
        summary: 'Контейнеры за пару команд.',
        tags: ['docker', 'контейнер', 'compose', 'установка'],
        sections: [
          {
            heading: 'Установка',
            table: {
              headers: ['Команда', 'Что делает'],
              rows: [
                ['curl -fsSL https://get.docker.com | sh', 'Поставить Docker'],
                ['sudo usermod -aG docker $USER', 'Запускать без sudo (перелогиниться)'],
                ['docker run -d -p 80:80 nginx', 'Запустить контейнер'],
                ['docker ps', 'Что запущено'],
                ['docker compose up -d', 'Поднять по docker-compose.yml'],
              ],
            },
            note: 'Данные храни в volume (-v), иначе пропадут при пересоздании контейнера.',
          },
        ],
      },
      {
        id: 'g-wireguard',
        title: 'VPN-сервер WireGuard',
        summary: 'Свой VPN для безопасного доступа.',
        tags: ['wireguard', 'vpn', 'сервер', 'туннель', 'удалённый доступ'],
        sections: [
          {
            heading: 'Установка и ключи',
            table: {
              headers: ['Команда', 'Что делает'],
              rows: [
                ['sudo apt install wireguard -y', 'Установить'],
                ['wg genkey | tee priv | wg pubkey > pub', 'Сгенерировать ключи'],
                ['sudo nano /etc/wireguard/wg0.conf', 'Создать конфиг'],
                ['sudo wg-quick up wg0', 'Поднять туннель'],
                ['sudo systemctl enable wg-quick@wg0', 'Автозапуск'],
              ],
            },
          },
          {
            heading: 'Что важно',
            bullets: [
              'Включить форвардинг: sysctl -w net.ipv4.ip_forward=1 (и в /etc/sysctl.conf).',
              'Открыть порт UDP 51820 в firewall и пробросить на роутере.',
              'На сервере — masquerade для трафика клиентов в интернет.',
              'Клиенту выдаётся свой адрес из подсети туннеля + публичный ключ сервера.',
            ],
            note: 'WireGuard — лучший выбор, когда нужен доступ домой/в офис без проброса опасных портов.',
          },
        ],
      },
    ],
  },

  // ───────────────────────── MIKROTIK ─────────────────────────
  {
    id: 'guide-mikrotik',
    title: 'Гайды: MikroTik (RouterOS)',
    icon: 'hardware-chip',
    color: '#f87171',
    roles: ['net'],
    articles: [
      {
        id: 'mt-basic',
        title: 'MikroTik: базовая настройка роутера',
        summary: 'WAN, LAN-bridge, DHCP, NAT, DNS, firewall.',
        tags: ['mikrotik', 'routeros', 'winbox', 'настройка', 'nat', 'dhcp'],
        sections: [
          {
            heading: '1. Подключение',
            bullets: [
              'Скачай Winbox, подключись по MAC (если IP неизвестен) или по 192.168.88.1.',
              'Логин admin, пароль пустой (на новом устройстве).',
              'Сразу задай пароль: /user set admin password=СильныйПароль',
              'Команды ниже — терминал Winbox или SSH (одинаково).',
            ],
          },
          {
            heading: '2. WAN (интернет на ether1)',
            table: {
              headers: ['Команда', 'Что'],
              rows: [
                ['/ip dhcp-client add interface=ether1 disabled=no', 'Получить IP от провайдера (DHCP)'],
                ['/ip dhcp-client print', 'Проверить, что получили адрес'],
              ],
            },
            note: 'Если провайдер даёт PPPoE — вместо dhcp-client: /interface pppoe-client add ...',
          },
          {
            heading: '3. LAN: мост и адрес',
            table: {
              headers: ['Команда', 'Что'],
              rows: [
                ['/interface bridge add name=bridge-lan', 'Создать мост для LAN'],
                ['/interface bridge port add bridge=bridge-lan interface=ether2', 'Добавить порт в мост'],
                ['(повторить для ether3, ether4, ether5)', 'Остальные LAN-порты'],
                ['/ip address add address=192.168.88.1/24 interface=bridge-lan', 'IP роутера в LAN'],
              ],
            },
          },
          {
            heading: '4. DHCP-сервер для LAN',
            bullets: [
              '/ip pool add name=lan-pool ranges=192.168.88.10-192.168.88.254',
              '/ip dhcp-server add interface=bridge-lan address-pool=lan-pool disabled=no name=dhcp1',
              '/ip dhcp-server network add address=192.168.88.0/24 gateway=192.168.88.1 dns-server=192.168.88.1',
            ],
            note: 'Проще через мастер: /ip dhcp-server setup и отвечать на вопросы.',
          },
          {
            heading: '5. NAT и DNS (выход в интернет)',
            table: {
              headers: ['Команда', 'Что'],
              rows: [
                ['/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade', 'NAT — раздать интернет в LAN'],
                ['/ip dns set servers=1.1.1.1,8.8.8.8 allow-remote-requests=yes', 'DNS для клиентов'],
              ],
            },
            note: 'После этого устройства в LAN должны получить интернет. Проверь с клиента: ping 8.8.8.8 и ping ya.ru.',
          },
        ],
      },
      {
        id: 'mt-firewall',
        title: 'MikroTik: базовый firewall',
        summary: 'Защита роутера со стороны интернета.',
        tags: ['mikrotik', 'firewall', 'безопасность', 'filter'],
        sections: [
          {
            heading: 'Минимальный набор правил',
            bullets: [
              '/ip firewall filter add chain=input connection-state=established,related action=accept',
              '/ip firewall filter add chain=input connection-state=invalid action=drop',
              '/ip firewall filter add chain=input in-interface=ether1 action=drop comment="drop WAN to router"',
            ],
            note: 'Это закрывает доступ к роутеру из интернета, оставляя работу изнутри. Управление — только из LAN/по VPN.',
          },
          {
            heading: 'Безопасность доступа',
            bullets: [
              'Отключи лишние сервисы: /ip service disable telnet,ftp,api,www (оставь нужное).',
              'Смени порт/ограничь Winbox по адресу.',
              'Обнови RouterOS: /system package update check-for-updates',
            ],
          },
        ],
      },
      {
        id: 'mt-portforward',
        title: 'MikroTik: проброс порта',
        summary: 'Доступ к сервису/камере снаружи (dst-nat).',
        tags: ['mikrotik', 'проброс', 'port forward', 'dst-nat'],
        sections: [
          {
            heading: 'Команда',
            body: [
              '/ip firewall nat add chain=dstnat in-interface=ether1 \\',
              '  protocol=tcp dst-port=8080 action=dst-nat \\',
              '  to-addresses=192.168.88.10 to-ports=80',
            ],
            note: 'Внешний порт 8080 → внутренний 192.168.88.10:80. Нужен «белый» IP (не CGNAT). Камеры/RDP — лучше через VPN.',
          },
        ],
      },
      {
        id: 'mt-backup',
        title: 'MikroTik: бэкап и восстановление',
        summary: 'Сохранить и перенести конфигурацию.',
        tags: ['mikrotik', 'бэкап', 'backup', 'export', 'восстановление'],
        sections: [
          {
            heading: 'Команды',
            table: {
              headers: ['Команда', 'Что'],
              rows: [
                ['/system backup save name=cfg', 'Полный бинарный бэкап (для того же устройства)'],
                ['/export file=cfg', 'Текстовый экспорт команд (читаемый, переносимый)'],
                ['/system backup load name=cfg', 'Восстановить бэкап'],
                ['/import file=cfg.rsc', 'Применить текстовый экспорт'],
              ],
            },
            note: 'Скачай файлы из Files в Winbox и храни отдельно. Текстовый /export удобно держать в системе документации.',
          },
        ],
      },
    ],
  },
];
