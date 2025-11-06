import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: number;
  text?: string;
  type: 'text' | 'image' | 'video' | 'file';
  sender: 'me' | 'them';
  time: string;
  encrypted: boolean;
  fileData?: {
    name: string;
    size: string;
    url?: string;
    preview?: string;
  };
  forwarded?: boolean;
  forwardedFrom?: string;
}

interface Contact {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

export default function Index() {
  const [selectedChat, setSelectedChat] = useState<number>(1);
  const [messageInput, setMessageInput] = useState('');
  const [view, setView] = useState<'chats' | 'contacts' | 'profile' | 'security'>('chats');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [forwardMode, setForwardMode] = useState<Message | null>(null);
  const { toast } = useToast();

  const contacts: Contact[] = [
    { id: 1, name: 'Киберхакер', lastMessage: 'Данные зашифрованы 🔒', time: '12:34', unread: 2, online: true },
    { id: 2, name: 'Неон-призрак', lastMessage: 'Встречаемся в сети', time: '11:20', unread: 0, online: true },
    { id: 3, name: 'Код-самурай', lastMessage: 'Файл получен', time: 'вчера', unread: 5, online: false },
    { id: 4, name: 'Дата-ниндзя', lastMessage: 'Проверь новый протокол', time: 'вчера', unread: 0, online: false },
  ];

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Привет! Все защищено?', type: 'text', sender: 'them', time: '12:30', encrypted: true },
    { id: 2, text: 'Да, E2E шифрование активно 🔐', type: 'text', sender: 'me', time: '12:31', encrypted: true },
    { id: 3, text: 'Отправляю секретные данные', type: 'text', sender: 'them', time: '12:32', encrypted: true },
    { 
      id: 4, 
      type: 'image', 
      sender: 'them', 
      time: '12:33', 
      encrypted: true, 
      fileData: { 
        name: 'cyberpunk_city.jpg', 
        size: '3.2 MB',
        preview: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop'
      } 
    },
    { 
      id: 5, 
      type: 'file', 
      sender: 'them', 
      time: '12:34', 
      encrypted: true, 
      fileData: { name: 'secret_data.enc', size: '2.4 MB' } 
    },
    { id: 6, text: 'Данные зашифрованы 🔒', type: 'text', sender: 'them', time: '12:35', encrypted: true },
  ]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    
    const newMessage: Message = {
      id: messages.length + 1,
      text: messageInput,
      type: 'text',
      sender: 'me',
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      encrypted: true,
    };
    
    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.type.startsWith('image/') ? 'image' : 
                     file.type.startsWith('video/') ? 'video' : 'file';
    
    const fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const fileUrl = URL.createObjectURL(file);
    
    const newMessage: Message = {
      id: messages.length + 1,
      type: fileType,
      sender: 'me',
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      encrypted: true,
      fileData: { 
        name: file.name, 
        size: fileSize,
        url: fileUrl,
        preview: fileType === 'image' || fileType === 'video' ? fileUrl : undefined
      }
    };
    
    setMessages([...messages, newMessage]);
    toast({
      title: "Файл отправлен",
      description: `${file.name} успешно зашифрован и отправлен`,
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const forwardMessage = (message: Message) => {
    const currentContact = contacts.find(c => c.id === selectedChat);
    const forwardedMessage: Message = {
      ...message,
      id: messages.length + 1,
      sender: 'me',
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      forwarded: true,
      forwardedFrom: currentContact?.name
    };
    
    setMessages([...messages, forwardedMessage]);
    setForwardMode(null);
    toast({
      title: "Сообщение переслано",
      description: "Сообщение зашифровано и отправлено",
    });
  };

  const copyMessage = (text?: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast({
        title: "Скопировано",
        description: "Текст скопирован в буфер обмена",
      });
    }
  };

  const deleteMessage = (messageId: number) => {
    setMessages(messages.filter(m => m.id !== messageId));
    toast({
      title: "Сообщение удалено",
      description: "Сообщение удалено из чата",
      variant: "destructive"
    });
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-sidebar flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-primary glow-cyan">
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">Я</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-sidebar glow-green"></div>
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">CyberChat</h2>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
            <Button size="icon" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
              <Icon name="Settings" size={20} />
            </Button>
          </div>
          
          <div className="relative">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Поиск..." 
              className="pl-10 bg-muted border-border focus:border-primary focus:glow-cyan transition-all"
            />
          </div>
        </div>

        <div className="flex border-b border-border">
          {[
            { id: 'chats', label: 'Чаты', icon: 'MessageSquare' },
            { id: 'contacts', label: 'Контакты', icon: 'Users' },
            { id: 'profile', label: 'Профиль', icon: 'User' },
            { id: 'security', label: 'Защита', icon: 'Shield' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as any)}
              className={`flex-1 py-3 text-xs font-medium transition-all ${
                view === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <ScrollArea className="flex-1">
          {view === 'chats' && (
            <div className="p-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedChat(contact.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all mb-1 ${
                    selectedChat === contact.id
                      ? 'bg-primary/20 border border-primary/50 glow-cyan'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-secondary/20 text-secondary font-semibold">
                        {contact.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {contact.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-sidebar glow-green"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-medium text-foreground truncate">{contact.name}</h3>
                      <span className="text-xs text-muted-foreground ml-2">{contact.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                  </div>
                  {contact.unread > 0 && (
                    <Badge className="bg-primary text-primary-foreground glow-cyan ml-2">
                      {contact.unread}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {view === 'contacts' && (
            <div className="p-4 space-y-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-all">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-secondary/20 text-secondary font-semibold">
                      {contact.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{contact.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {contact.online ? '🟢 В сети' : '⚫ Не в сети'}
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" className="text-primary">
                    <Icon name="MessageCircle" size={20} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {view === 'profile' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 border-4 border-primary glow-cyan mb-4">
                  <AvatarFallback className="bg-primary/20 text-primary text-3xl font-bold">Я</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold text-foreground mb-1">Ваш профиль</h2>
                <p className="text-sm text-muted-foreground">@cybername</p>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <Icon name="User" size={20} className="text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Имя пользователя</p>
                      <p className="font-medium">CyberUser</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <Icon name="Phone" size={20} className="text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Телефон</p>
                      <p className="font-medium">+7 XXX XXX XX XX</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <Icon name="Mail" size={20} className="text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">cyber@secure.net</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'security' && (
            <div className="p-6 space-y-4">
              <div className="text-center mb-6">
                <Icon name="ShieldCheck" size={48} className="text-accent mx-auto mb-3 glow-green" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Безопасность</h2>
                <p className="text-sm text-muted-foreground">Все сообщения защищены E2E шифрованием</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-card border border-accent/50 glow-green">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon name="Lock" size={18} className="text-accent" />
                      <span className="font-medium text-sm">E2E Шифрование</span>
                    </div>
                    <Badge variant="outline" className="border-accent text-accent">Активно</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Сквозное шифрование включено для всех чатов</p>
                </div>

                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon name="Key" size={18} className="text-primary" />
                      <span className="font-medium text-sm">Ключи шифрования</span>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">Обновить</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Последнее обновление: сегодня</p>
                </div>

                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon name="Eye" size={18} className="text-secondary" />
                      <span className="font-medium text-sm">Конфиденциальность</span>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">Настроить</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Управление видимостью и доступом</p>
                </div>

                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon name="Fingerprint" size={18} className="text-primary" />
                      <span className="font-medium text-sm">Двухфакторная аутентификация</span>
                    </div>
                    <Badge variant="outline">Не настроена</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Включите для дополнительной защиты</p>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-secondary/20 text-secondary font-semibold">
                {contacts.find(c => c.id === selectedChat)?.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground">{contacts.find(c => c.id === selectedChat)?.name}</h2>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {contacts.find(c => c.id === selectedChat)?.online ? 'в сети' : 'не в сети'}
                </p>
                <Badge variant="outline" className="text-[10px] border-accent text-accent px-1.5 py-0">
                  <Icon name="Lock" size={10} className="mr-1" />
                  E2E
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
              <Icon name="Phone" size={20} />
            </Button>
            <Button size="icon" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
              <Icon name="Video" size={20} />
            </Button>
            <Button size="icon" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
              <Icon name="MoreVertical" size={20} />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <ContextMenu key={message.id}>
                <ContextMenuTrigger>
                  <div
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md ${message.sender === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {message.forwarded && (
                        <div className="flex items-center gap-1 px-2 text-xs text-secondary">
                          <Icon name="CornerUpRight" size={12} />
                          <span>Переслано от {message.forwardedFrom}</span>
                        </div>
                      )}
                      
                      {message.type === 'text' && (
                        <div
                          className={`px-4 py-2.5 rounded-2xl ${
                            message.sender === 'me'
                              ? 'bg-primary text-primary-foreground glow-cyan rounded-br-sm'
                              : 'bg-card border border-border rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                      )}
                      
                      {message.type === 'image' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <div
                              className={`rounded-2xl overflow-hidden cursor-pointer border-2 ${
                                message.sender === 'me'
                                  ? 'border-primary/50 glow-cyan'
                                  : 'border-border'
                              }`}
                            >
                              <img 
                                src={message.fileData?.preview} 
                                alt={message.fileData?.name}
                                className="max-w-xs max-h-64 object-cover hover:opacity-90 transition-opacity"
                              />
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl p-0 border-2 border-primary glow-cyan">
                            <img 
                              src={message.fileData?.preview} 
                              alt={message.fileData?.name}
                              className="w-full h-auto"
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                      
                      {message.type === 'video' && (
                        <div
                          className={`rounded-2xl overflow-hidden border-2 ${
                            message.sender === 'me'
                              ? 'border-primary/50 glow-cyan'
                              : 'border-border'
                          }`}
                        >
                          <video 
                            src={message.fileData?.preview} 
                            controls
                            className="max-w-xs max-h-64"
                          />
                        </div>
                      )}
                      
                      {message.type === 'file' && (
                        <div
                          className={`px-4 py-3 rounded-2xl border ${
                            message.sender === 'me'
                              ? 'bg-primary/10 border-primary/50 glow-cyan rounded-br-sm'
                              : 'bg-card border-border rounded-bl-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-secondary/20">
                              <Icon name="File" size={24} className="text-secondary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{message.fileData?.name}</p>
                              <p className="text-xs text-muted-foreground">{message.fileData?.size}</p>
                            </div>
                            {message.fileData?.url && (
                              <a href={message.fileData.url} download={message.fileData.name}>
                                <Button size="icon" variant="ghost" className="ml-2">
                                  <Icon name="Download" size={16} />
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 px-2">
                        <span className="text-xs text-muted-foreground">{message.time}</span>
                        {message.encrypted && (
                          <Icon name="Lock" size={10} className="text-accent" />
                        )}
                        {message.sender === 'me' && (
                          <Icon name="CheckCheck" size={12} className="text-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48 bg-card border-primary/30 glow-cyan">
                  <ContextMenuItem 
                    onClick={() => forwardMessage(message)}
                    className="cursor-pointer hover:bg-primary/20"
                  >
                    <Icon name="Forward" size={16} className="mr-2" />
                    Переслать
                  </ContextMenuItem>
                  {message.text && (
                    <ContextMenuItem 
                      onClick={() => copyMessage(message.text)}
                      className="cursor-pointer hover:bg-primary/20"
                    >
                      <Icon name="Copy" size={16} className="mr-2" />
                      Копировать текст
                    </ContextMenuItem>
                  )}
                  {message.fileData?.url && (
                    <ContextMenuItem 
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = message.fileData!.url!;
                        a.download = message.fileData!.name;
                        a.click();
                      }}
                      className="cursor-pointer hover:bg-primary/20"
                    >
                      <Icon name="Download" size={16} className="mr-2" />
                      Скачать
                    </ContextMenuItem>
                  )}
                  {message.sender === 'me' && (
                    <ContextMenuItem 
                      onClick={() => deleteMessage(message.id)}
                      className="cursor-pointer hover:bg-destructive/20 text-destructive"
                    >
                      <Icon name="Trash2" size={16} className="mr-2" />
                      Удалить
                    </ContextMenuItem>
                  )}
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t border-border bg-card p-4">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          />
          
          <div className="max-w-4xl mx-auto flex gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-secondary hover:text-secondary hover:bg-secondary/10"
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon name="Image" size={20} />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-secondary hover:text-secondary hover:bg-secondary/10"
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon name="Video" size={20} />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon name="Paperclip" size={20} />
            </Button>
            
            <Input
              placeholder="Введите сообщение..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-muted border-border focus:border-primary focus:glow-cyan transition-all"
            />
            
            <Button 
              onClick={sendMessage}
              className="bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan"
            >
              <Icon name="Send" size={20} />
            </Button>
          </div>
          
          <div className="max-w-4xl mx-auto mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Icon name="ShieldCheck" size={12} className="text-accent" />
            <span>Ваши сообщения защищены сквозным шифрованием</span>
          </div>
        </div>
      </div>
    </div>
  );
}