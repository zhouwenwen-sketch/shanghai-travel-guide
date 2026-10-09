import { Injectable } from '@nestjs/common'

@Injectable()
export class ClockService {
  now(): Date {
    return new Date()
  }

  todayInShanghai(at: Date = this.now()): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(at)
  }

  dateInShanghai(at: Date = this.now()): Date {
    return new Date(`${this.todayInShanghai(at)}T00:00:00.000Z`)
  }
}
