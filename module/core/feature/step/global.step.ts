import { after, before, binding, given } from 'cucumber-tsflow';
import { Context } from '../context/context';
import { initApplication } from '../cucumber.testing-module';

@binding([Context])
export class UserStep {
  // Hook, executed before each scenario
  @before()
  public async before(): Promise<void> {
    Context.app = await initApplication();
  }

  // Hook, executed after each scenario
  @after()
  async clear() {
    Context.clearAllData();
  }
}
