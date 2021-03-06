import { IBasicRequestService } from '@/service/common/request';
import { CompleteStatus } from 'common/backend/interface';
import Container from 'typedi';
import { DocumentService, CreateDocumentRequest } from '../../index';
import showdown from 'showdown';
import { ICookieService } from '@/service/common/cookie';

export default class GithubDocumentService implements DocumentService {
  getId = () => {
    return 'Flomo';
  };

  getUserInfo = async () => {
    return {
      name: 'Flomo',
      avatar: '',
      homePage: 'https://flomoapp.com/',
      description: 'Flomo',
    };
  };

  getRepositories = async () => {
    return [
      {
        id: 'flomo',
        name: 'Flomo',
        groupId: 'flomo',
        groupName: 'Flomo',
      },
    ];
  };

  createDocument = async (info: CreateDocumentRequest): Promise<CompleteStatus> => {
    const request = Container.get(IBasicRequestService);
    const converter = new showdown.Converter({});

    converter.addExtension({
      type: 'html',
      filter: (html: string) => {
        console.log(html);
        return html.replace(/<img src="(.+?)"(.*)\/>/g, '<p>$1</p>');
      },
    });
    const cookies = await Container.get(ICookieService).get({
      name: 'XSRF-TOKEN',
      url: 'https://flomoapp.com/',
    });
    if (!cookies) {
      throw new Error('Please Login');
    }
    request.request('https://flomoapp.com/api/memo/', {
      method: 'put',
      requestType: 'json',
      headers: {
        'x-requested-with': 'XMLHttpRequest',
        'x-xsrf-token': decodeURIComponent(cookies?.value!),
      },
      data: {
        source: 'web',
        parent_memo_slug: null,
        content: converter.makeHtml(info.content),
        file_ids: [],
      },
    });
    return {
      href: `https://flomoapp.com/mine`,
    };
  };
}
