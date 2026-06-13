import { KbCategory } from './types';

/**
 * «Ситуации и решения» — практические разборы реальных проблем сисадмина
 * с конкретными командами под Linux и Windows. Стиль: что случилось →
 * как диагностировать → чем чинить.
 */
export const playbooks: KbCategory[] = [
  {
    id: 'pb-os',
    title: 'Ситуации: сервер и ОС',
    icon: 'construct',
    color: '#fbbf24',
    roles: ['net'],
    articles: [
      {
        id: 'pb-disk-full',
        title: 'Закончилось место на диске',
        summary: 'df показывает 100%, сервис падает.',
        tags: ['диск', 'место', 'df', 'no space', 'переполнен', 'cleanmgr'],
        sections: [
          {
            heading: 'Диагностика — Linux',
            table: {
              headers: ['Команда', 'Что делает'],
              rows: [
                ['df -h', 'Какой раздел заполнен'],
                ['df -i', 'Не кончились ли inodes'],
                ['du -xh / | sort -h | tail -20', 'Самые тяжёлые каталоги'],
                ['du -ah /var | sort -h | tail', 'Что распухло в /var'],
                ['journalctl --disk-usage', 'Объём логов systemd'],
                ['lsof +L1', 'Удалённые, но открытые файлы (держат место)'],
              ],
            },
          },
          {
            heading: 'Чистка — Linux',
            bullets: [
              'journalctl --vacuum-size=200M — обрезать логи journald.',
              'apt clean / dnf clean all — кэш пакетов.',
              'Найти большие файлы: find / -xdev -type f -size +500M.',
              'Удалённый-но-открытый файл: перезапусти процесс из lsof +L1.',
              'Проверь /tmp, старые бэкапы, ядра (apt autoremove).',
            ],
          },
          {
            heading: 'Windows',
            table: {
              headers: ['Действие', 'Как'],
              rows: [
                ['Очистка диска', 'cleanmgr / Storage Sense'],
                ['Что занимает', 'WinDirStat / TreeSize'],
                ['Очистить компоненты', 'DISM /online /Cleanup-Image /StartComponentCleanup'],
                ['Временные', 'Удалить C:\\Windows\\Temp и %TEMP%'],
              ],
            },
            note: 'После чистки перезапусти упавший сервис. Если место «съели» логи — настрой ротацию (logrotate).',
          },
        ],
      },
      {
        id: 'pb-high-load',
        title: 'Высокая нагрузка: CPU / память',
        summary: 'Сервер тормозит, load average высокий.',
        tags: ['нагрузка', 'cpu', 'память', 'top', 'oom', 'load average'],
        sections: [
          {
            heading: 'Linux',
            table: {
              headers: ['Команда', 'Что'],
              rows: [
                ['top / htop', 'Кто грузит CPU/RAM в реальном времени'],
                ['ps aux --sort=-%cpu | head', 'Топ по CPU'],
                ['ps aux --sort=-%mem | head', 'Топ по памяти'],
                ['free -h', 'Свободная память и swap'],
                ['vmstat 1', 'CPU/IO/своп по секундам'],
                ['dmesg | grep -i oom', 'Убивал ли OOM-killer процессы'],
                ['uptime', 'Load average (1/5/15 мин)'],
              ],
            },
            note: 'Load average ≈ числу ядер — норма. Сильно выше — очередь на CPU или диск.',
          },
          {
            heading: 'Действия',
            bullets: [
              'renice +10 PID — понизить приоритет прожорливого процесса.',
              'kill -15 PID (мягко), затем kill -9 PID (жёстко).',
              'Нет памяти — добавь swap или RAM, ищи утечку.',
              'Windows: Диспетчер задач / Монитор ресурсов, Get-Process | Sort CPU -desc.',
            ],
          },
        ],
      },
      {
        id: 'pb-service',
        title: 'Служба/сервис не запускается',
        summary: 'systemctl/Services показывает ошибку.',
        tags: ['служба', 'сервис', 'systemctl', 'не запускается', 'failed'],
        sections: [
          {
            heading: 'Linux (systemd)',
            table: {
              headers: ['Команда', 'Что'],
              rows: [
                ['systemctl status nginx', 'Статус и последние ошибки'],
                ['journalctl -u nginx -e', 'Подробные логи службы'],
                ['nginx -t / sshd -t', 'Проверка конфига на ошибки'],
                ['ss -tulpn | grep :80', 'Не занят ли порт другим'],
                ['systemctl restart nginx', 'Перезапуск после правки'],
              ],
            },
          },
          {
            heading: 'Частые причины',
            bullets: [
              'Ошибка в конфиге — проверь -t перед стартом.',
              'Порт занят другим процессом — найди в ss/netstat.',
              'Нет прав на файл/каталог или сертификат.',
              'Не хватило памяти/места (см. соседние разборы).',
              'Windows: services.msc → Свойства → вкладка «Вход», Event Viewer, sc query имя.',
            ],
          },
        ],
      },
      {
        id: 'pb-port-busy',
        title: 'Порт уже занят / кто слушает порт',
        summary: '«Address already in use».',
        tags: ['порт', 'занят', 'address in use', 'ss', 'netstat', 'lsof'],
        sections: [
          {
            heading: 'Найти и освободить',
            table: {
              headers: ['ОС', 'Команда'],
              rows: [
                ['Linux', 'ss -tulpn | grep :8080'],
                ['Linux', 'lsof -i :8080'],
                ['Linux', 'kill -9 <PID>'],
                ['Windows', 'netstat -ano | findstr :8080'],
                ['Windows', 'tasklist /fi "PID eq <PID>"'],
                ['Windows', 'taskkill /PID <PID> /F'],
              ],
            },
            note: 'Если порт нужен сервису — останови конфликтующий процесс или смени порт в конфиге.',
          },
        ],
      },
      {
        id: 'pb-password',
        title: 'Сброс забытого пароля',
        summary: 'Нет доступа root / администратора.',
        tags: ['пароль', 'сброс', 'root', 'администратор', 'recovery', 'passwd'],
        sections: [
          {
            heading: 'Linux',
            bullets: [
              'В GRUB выбери пункт recovery (или допиши «init=/bin/bash» в строку ядра).',
              'mount -o remount,rw / — сделать корень записываемым.',
              'passwd <пользователь> — задать новый пароль.',
              'Перезагрузка: exec /sbin/init или reboot -f.',
            ],
          },
          {
            heading: 'Windows',
            bullets: [
              'Если есть второй админ: net user <user> <newpass>.',
              'Локальная учётка без админа — загрузка с установочного носителя, замена utilman.exe на cmd (метод восстановления).',
              'Доменная учётка — сброс на контроллере домена (AD Users & Computers).',
            ],
            note: 'Сброс пароля — только на своём/авторизованном оборудовании. Доступ к чужим системам без разрешения недопустим.',
          },
        ],
      },
      {
        id: 'pb-frozen',
        title: 'Зависший сервер / процесс',
        summary: 'Не отвечает, нужно аккуратно перезапустить.',
        tags: ['зависание', 'frozen', 'kill', 'sysrq', 'reboot'],
        sections: [
          {
            heading: 'Процесс',
            bullets: [
              'Linux: pkill <имя> или kill -9 <PID>; killall <имя>.',
              'Windows: taskkill /IM app.exe /F; Stop-Process -Name app -Force.',
            ],
          },
          {
            heading: 'Весь сервер (Linux)',
            bullets: [
              'Если есть SSH: systemctl reboot.',
              'Совсем завис — Magic SysRq (безопасная перезагрузка): по очереди R E I S U B (если включён kernel.sysrq).',
              'Через IPMI/iDRAC/iLO — питание/консоль удалённо.',
            ],
            note: 'Жёсткое выключение — крайняя мера, возможна потеря данных. Сначала пробуй мягко.',
          },
        ],
      },
      {
        id: 'pb-boot',
        title: 'Сервер не загружается',
        summary: 'Ошибка загрузки, файловая система, загрузчик.',
        tags: ['загрузка', 'boot', 'grub', 'fsck', 'bootrec', 'chkdsk'],
        sections: [
          {
            heading: 'Linux',
            bullets: [
              'Загрузись в recovery/live-USB.',
              'fsck /dev/sdaX — проверка и починка ФС (на отмонтированном разделе).',
              'Проверь /etc/fstab (ошибочная запись блокирует загрузку — добавь nofail или закомментируй).',
              'Сломан GRUB — grub-install + update-grub из chroot.',
            ],
          },
          {
            heading: 'Windows',
            table: {
              headers: ['Команда (среда восстановления)', 'Что'],
              rows: [
                ['bootrec /fixmbr', 'Починить MBR'],
                ['bootrec /fixboot', 'Починить загрузочный сектор'],
                ['bootrec /rebuildbcd', 'Пересобрать список ОС'],
                ['sfc /scannow', 'Проверить системные файлы'],
                ['chkdsk C: /f', 'Проверить диск'],
              ],
            },
          },
        ],
      },
    ],
  },

  {
    id: 'pb-net',
    title: 'Ситуации: сеть',
    icon: 'pulse',
    color: '#22c55e',
    roles: ['net'],
    articles: [
      {
        id: 'pb-no-net-server',
        title: 'На сервере нет интернета',
        summary: 'Пошаговая локализация по уровням.',
        tags: ['нет интернета', 'сеть', 'ip', 'route', 'gateway', 'no network'],
        sections: [
          {
            heading: 'Linux — по порядку',
            table: {
              headers: ['Шаг', 'Команда'],
              rows: [
                ['Интерфейс поднят?', 'ip a (есть IP, state UP?)'],
                ['Есть маршрут?', 'ip r (есть default via ...?)'],
                ['Доходит до шлюза?', 'ping <шлюз>'],
                ['Есть интернет по IP?', 'ping 1.1.1.1'],
                ['Работает DNS?', 'ping ya.ru / dig ya.ru'],
              ],
            },
          },
          {
            heading: 'Починка',
            bullets: [
              'Нет IP: dhclient eth0 или nmcli con up <имя>.',
              'Нет маршрута: ip route add default via 192.168.1.1 dev eth0.',
              'Поднять интерфейс: ip link set eth0 up.',
              'DNS не работает: проверь /etc/resolv.conf (nameserver 1.1.1.1).',
              'Windows: ipconfig /all, route print, ipconfig /renew, ipconfig /flushdns.',
            ],
          },
        ],
      },
      {
        id: 'pb-dns',
        title: 'DNS не резолвит',
        summary: 'Пинг по IP идёт, по имени — нет.',
        tags: ['dns', 'не резолвит', 'nslookup', 'dig', 'resolv.conf', 'flushdns'],
        sections: [
          {
            heading: 'Проверка',
            table: {
              headers: ['ОС', 'Команда'],
              rows: [
                ['Linux', 'dig @1.1.1.1 ya.ru (работает ли внешний DNS)'],
                ['Linux', 'cat /etc/resolv.conf (какой сервер прописан)'],
                ['Linux', 'resolvectl status (systemd-resolved)'],
                ['Windows', 'nslookup ya.ru 1.1.1.1'],
                ['Windows', 'ipconfig /flushdns (сбросить кэш)'],
              ],
            },
          },
          {
            heading: 'Решение',
            bullets: [
              'Если внешний DNS отвечает, а системный нет — поменяй DNS на 1.1.1.1/8.8.8.8.',
              'Проверь, не блокирует ли firewall порт 53.',
              'В домене AD клиент должен указывать на DNS контроллера домена.',
              'Очисти кэш: Linux — resolvectl flush-caches; Windows — ipconfig /flushdns.',
            ],
          },
        ],
      },
      {
        id: 'pb-latency',
        title: 'Высокий ping и потери пакетов',
        summary: 'Тормозит, рвётся, лагает.',
        tags: ['ping', 'потери', 'latency', 'mtr', 'дуплекс', 'ошибки'],
        sections: [
          {
            heading: 'Где теряется',
            table: {
              headers: ['Команда', 'Что'],
              rows: [
                ['mtr <host>', 'Трассировка + потери по хопам'],
                ['ping -t / ping -c 100', 'Стабильность и потери'],
                ['ethtool eth0', 'Скорость/дуплекс линка (Linux)'],
                ['ip -s link', 'Ошибки/дропы на интерфейсе'],
              ],
            },
          },
          {
            heading: 'Причины',
            bullets: [
              'Потери уже на первом хопе — локальная сеть/кабель/Wi-Fi.',
              'Дуплекс half/несовпадение скорости — пересогласуй порт/замени кабель.',
              'Перегруз канала — смотри загрузку, QoS.',
              'Wi-Fi — смени канал (2.4 ГГц: 1/6/11), приблизь точку.',
            ],
          },
        ],
      },
      {
        id: 'pb-port-forward',
        title: 'Не работает проброс портов / доступ снаружи',
        summary: 'Снаружи не достучаться до сервиса/камеры.',
        tags: ['проброс', 'port forwarding', 'cgnat', 'белый ip', 'доступ снаружи'],
        sections: [
          {
            heading: 'Проверки',
            bullets: [
              'Сервис вообще слушает? ss -tulpn | grep <порт>.',
              'Локально с другого устройства порт открыт? (telnet/Test-NetConnection).',
              'Белый ли IP? Сравни IP в роутере (WAN) с whatismyip. Если 100.64.x.x — это CGNAT, проброс невозможен.',
              'Не Double NAT ли (два роутера)?',
              'Firewall на сервере не режет порт?',
            ],
          },
          {
            heading: 'Решение',
            bullets: [
              'Серый IP — закажи белый у провайдера или используй VPN/облако.',
              'Double NAT — мост на одном роутере или DMZ.',
              'Открой порт в firewall сервера (ufw allow / правило Windows).',
              'Безопаснее проброса — VPN (WireGuard) в свою сеть.',
            ],
            note: 'Не выставляй RDP (3389) и камеры напрямую в интернет — только через VPN.',
          },
        ],
      },
      {
        id: 'pb-slow-lan',
        title: 'Скорость 100 вместо 1000 Мбит/с',
        summary: 'Гигабит не поднимается.',
        tags: ['100', '1000', 'гигабит', 'дуплекс', 'кабель', 'split pair'],
        sections: [
          {
            heading: 'Проверка и причины',
            bullets: [
              'Linux: ethtool eth0 — Speed: 100Mb/s? Windows: состояние адаптера.',
              'Чаще всего — перебита пара в кабеле (для 1 Гбит нужны все 4 пары).',
              'Прозвони кабель тестером, переобожми по T568B с обоих концов.',
              'Проверь, что порт свитча и карта — гигабитные.',
              'Плохой/длинный (>100 м) кабель или дешёвый патч-корд.',
            ],
          },
        ],
      },
      {
        id: 'pb-firewall',
        title: 'Firewall блокирует соединение',
        summary: 'Порт «closed/filtered», сервис не доступен.',
        tags: ['firewall', 'ufw', 'iptables', 'заблокирован', 'netsh'],
        sections: [
          {
            heading: 'Linux',
            table: {
              headers: ['Команда', 'Что'],
              rows: [
                ['ufw status / iptables -L -n', 'Текущие правила'],
                ['ufw allow 443/tcp', 'Открыть порт'],
                ['ufw allow from 10.0.0.0/24', 'Разрешить подсеть'],
                ['ufw disable (временно)', 'Проверить, в фаере ли дело'],
              ],
            },
          },
          {
            heading: 'Windows',
            bullets: [
              'wf.msc — графический брандмауэр.',
              'netsh advfirewall firewall add rule name="App" dir=in action=allow protocol=TCP localport=443.',
              'Get-NetFirewallRule — список правил (PowerShell).',
            ],
            note: 'После теста с выключенным firewall обязательно включи его обратно и добавь точечное правило.',
          },
        ],
      },
    ],
  },

  {
    id: 'pb-services',
    title: 'Ситуации: сервисы и AD',
    icon: 'business',
    color: '#38bdf8',
    roles: ['net'],
    articles: [
      {
        id: 'pb-time',
        title: 'Рассинхрон времени (ломает AD, сертификаты)',
        summary: 'Время «уехало» — отвал Kerberos/HTTPS.',
        tags: ['время', 'ntp', 'chrony', 'w32tm', 'kerberos', 'синхронизация'],
        sections: [
          {
            heading: 'Linux',
            table: {
              headers: ['Команда', 'Что'],
              rows: [
                ['timedatectl', 'Текущее время и статус синхронизации'],
                ['chronyc sources', 'Источники NTP и смещение'],
                ['systemctl restart chronyd', 'Перезапуск синхронизации'],
              ],
            },
          },
          {
            heading: 'Windows',
            bullets: [
              'w32tm /query /status — статус.',
              'w32tm /resync — синхронизировать сейчас.',
              'В домене клиенты берут время с контроллера; разница > 5 мин ломает вход (Kerberos).',
            ],
            note: 'Истёкший/«невалидный» сертификат часто = сбитое время. Сначала проверь часы.',
          },
        ],
      },
      {
        id: 'pb-cert',
        title: 'Истёк / не работает SSL-сертификат',
        summary: 'Браузер ругается, HTTPS не открывается.',
        tags: ['сертификат', 'ssl', 'tls', 'openssl', 'certbot', 'истёк'],
        sections: [
          {
            heading: 'Проверка',
            table: {
              headers: ['Команда', 'Что'],
              rows: [
                ['openssl x509 -enddate -noout -in cert.pem', 'Дата окончания'],
                ['openssl s_client -connect host:443', 'Что отдаёт сервер'],
                ['echo | openssl s_client -connect host:443 2>/dev/null | openssl x509 -noout -dates', 'Срок у живого сайта'],
              ],
            },
          },
          {
            heading: 'Решение',
            bullets: [
              "Let's Encrypt: certbot renew, затем перезапуск сервиса (nginx/apache).",
              'Проверь, что отдаётся полная цепочка (fullchain), не только сертификат.',
              'Проверь системное время (см. соседний разбор).',
              'Настрой автопродление (cron/systemd timer), чтобы не повторялось.',
            ],
          },
        ],
      },
      {
        id: 'pb-gpo',
        title: 'Не применяется групповая политика (GPO)',
        summary: 'Настройки домена не доезжают до клиента.',
        tags: ['gpo', 'групповая политика', 'gpupdate', 'gpresult', 'ad'],
        sections: [
          {
            heading: 'Диагностика',
            table: {
              headers: ['Команда', 'Что'],
              rows: [
                ['gpupdate /force', 'Применить политики сейчас'],
                ['gpresult /r', 'Какие политики применились'],
                ['gpresult /h rep.html', 'Подробный HTML-отчёт'],
              ],
            },
          },
          {
            heading: 'Частые причины',
            bullets: [
              'DNS клиента не указывает на контроллер домена.',
              'Рассинхрон времени с DC.',
              'Политика прилинкована не к той OU, где объект.',
              'Фильтрация по группам безопасности исключает объект.',
              'Нет связи с DC (ping dc, проверь сеть).',
            ],
          },
        ],
      },
      {
        id: 'pb-web5xx',
        title: 'Сайт отдаёт 502 / 503 / 504',
        summary: 'Веб-сервер жив, приложение — нет.',
        tags: ['502', '503', '504', 'nginx', 'php-fpm', 'gateway', 'backend'],
        sections: [
          {
            heading: 'Что значит',
            table: {
              headers: ['Код', 'Причина'],
              rows: [
                ['502 Bad Gateway', 'Бэкенд недоступен/упал'],
                ['503 Service Unavailable', 'Перегруз/сервис остановлен'],
                ['504 Gateway Timeout', 'Бэкенд не ответил вовремя'],
              ],
            },
          },
          {
            heading: 'Действия',
            bullets: [
              'Жив ли бэкенд: systemctl status php-fpm (или app), ss -tulpn по его порту/сокету.',
              'Логи: tail -f /var/log/nginx/error.log и лог приложения.',
              'Проверь конфиг: nginx -t, затем systemctl reload nginx.',
              'Перезапусти бэкенд; проверь нагрузку/память/место на диске.',
            ],
          },
        ],
      },
      {
        id: 'pb-incident',
        title: 'Подозрение на взлом / шифровальщик',
        summary: 'Действовать спокойно и по шагам (defensive).',
        tags: ['взлом', 'шифровальщик', 'ransomware', 'инцидент', 'безопасность'],
        sections: [
          {
            heading: 'Первые шаги',
            bullets: [
              'Изолируй: отключи заражённую машину от сети (не выключай сразу — потеряешь улики в памяти, если есть план форензики).',
              'Не плати выкуп — нет гарантий, поощряет атаки.',
              'Оцени масштаб: какие системы и учётки затронуты.',
              'Смени пароли и ключи с чистой машины.',
            ],
          },
          {
            heading: 'Восстановление',
            bullets: [
              'Восстанавливай из офлайн/неизменяемого бэкапа (вот зачем правило 3-2-1).',
              'Перед возвратом в строй — найди и закрой точку входа (уязвимость/фишинг/RDP наружу).',
              'Включи MFA, убери лишние внешние доступы, обнови ПО.',
              'Зафиксируй инцидент и извлеки уроки.',
            ],
            note: 'Это базовый defensive-план. Для серьёзного инцидента привлекай профильных специалистов по ИБ.',
          },
        ],
      },
    ],
  },
];
