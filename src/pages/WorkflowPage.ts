import { BasePage } from "./basePage";
import { Page, expect, Locator } from "@playwright/test";
import { generateRandomString } from "../utils/commonUtils";

import { time } from "console";

export class WorkflowPage extends BasePage {
  operations: any;
  workflowName: any;
  spinner: any;
  newButton: any;
  pencil: any;
  renameInput: any;
  applyButton: any;
  saveWorkflow: any;
  trigger: any;
  addTrigger: any;
  triggerSelect: any;
  manualTrigger: any;
  triggerAdd: any;
  triggerSlot: any;
  activity: any;
  activityItem: any;
  activityType: any;
  action: any;
  actionType: any;
  runRecon: any;
  sourceType: any;
  workspace: any;
  reconId: any;
  testsigmaRecon: any;
  publishButton: any;
  instances: any;
  startButton: any;
  running: any;
  refresh: any;
  completed: any;

  generatedWorkflowName: string;

  constructor(page: Page) {
    super(page);

    // MAIN NAVIGATION
    this.operations = this.getLocator(
      "//div[contains(@class,'transition') and contains(@class,'contrast-more')]//*[local-name()='svg']"
    );

    this.workflowName = this.getLocator(
      '//p[@title="Your workflows and processes"]/preceding-sibling::p[normalize-space()="Workflows"]'
    );

    this.spinner = this.getLocator(
      "//div[contains(@class,'fixed') and contains(@class,'backdrop-blur-xs') and contains(@class,'block')]//*[local-name()='svg']"
    );

    this.newButton = this.getLocator('//div[@data-testid="-listingView-listingHeader"]//button');
    this.pencil = this.getLocator('//div[@class="text-secondary cursor-pointer"]');
    this.renameInput = this.getLocator("//input[@id='input_text']");
    this.applyButton = this.getLocator('//div[normalize-space()="Apply"]');
    this.saveWorkflow = this.getLocator('//div[normalize-space()="Save"]');

    // TRIGGER
    this.trigger = this.getLocator(
      "(//div[contains(@class,'flex-col') and contains(@class,'rounded')]//div[contains(@class,'rounded')])[1]"
    );
    this.addTrigger = this.getLocator('//div[text()="Add"]');
    this.triggerSelect = this.getLocator("//input[@id='triggerType']");
    this.manualTrigger = this.getLocator('//p[normalize-space()="Manual Trigger"]');
    this.triggerAdd = this.getLocator("(//div[text()='Add'])[2]");

    // ACTIVITY
    this.triggerSlot = this.getLocator('(//div[@role="button"])[1]');
    this.activity = this.getLocator('//p[normalize-space()="Activity"]/..');
    this.activityItem = this.getLocator('//p[normalize-space()="activity_1_"]');
    this.activityType = this.getLocator("//input[@id='subType']");
    this.action = this.getLocator("//p[normalize-space()='Action']");
    this.actionType = this.getLocator("//input[@id='actionType']");
    this.runRecon = this.getLocator("//p[normalize-space()='Run Recon']");
    this.sourceType = this.getLocator("//input[@id='source_type_recon_id']");
    this.workspace = this.getLocator("//p[normalize-space()='Workspace']");
    this.reconId = this.getLocator("//input[@id='recon_id']");
    this.testsigmaRecon = this.getLocator("//p[normalize-space()='testsigma_recon']");
    this.publishButton = this.getLocator('(//div[normalize-space()="Publish"])[1]');

    // EXECUTION
    this.instances = this.getLocator('//div[normalize-space()="Instances"]');
    this.startButton = this.getLocator('//div[normalize-space()="Start"]');
    this.running = this.getLocator('//p[normalize-space()="Running"]');
    this.refresh = this.getLocator('//div[normalize-space()="Refresh"]');
    this.completed = this.getLocator('(//p[text()="Completed"])[2]');

    this.generatedWorkflowName = "";
  }

  // =========================================================
  // HELPERS
  // =========================================================

  async waitForSpinner(): Promise<this> {
    await this.waitForElementToDisappear(this.spinner);
    return this;
  }

  // =========================================================
  // WORKFLOW NAVIGATION
  // =========================================================

  async navigateToWorkflow(): Promise<this> {
    await this.waitForSpinner();
    await this.click(this.operations);
    await this.waitForElementIsVisible(this.workflowName);
    await this.click(this.workflowName);
    //await this.waitForSpinner();
    return this;
  }

  // =========================================================
  // CREATE WORKFLOW
  // =========================================================

  async createNewWorkflow(): Promise<string> {
    await this.click(this.newButton);
    await this.waitForElementIsVisible(this.pencil);
    await this.click(this.pencil);

    this.generatedWorkflowName = `Workflow_${generateRandomString(6)}`;

    await this.waitForElementIsVisible(this.renameInput);
    await this.clear(this.renameInput);
    await this.type(this.renameInput, this.generatedWorkflowName);
       
    await this.click(this.applyButton);
    await this.click(this.saveWorkflow);
    await this.waitForTextOnPage("Workflow saved");
    

    await this.waitForSpinner();
    return this.generatedWorkflowName;
  }

  // =========================================================
  // MANUAL TRIGGER
  // =========================================================

  async addManualTrigger(): Promise<this> {
    await this.waitForSpinner();
    await this.click(this.trigger);
    await this.click(this.addTrigger);
    await this.click(this.triggerSelect);
    await this.click(this.manualTrigger);
    await this.click(this.triggerAdd);
    await this.waitForSpinner();
    return this;
  }

  // =========================================================
  // ACTIVITY CONFIGURATION
  // =========================================================

  async addRunReconActivity(): Promise<this> {
    await this.waitForSpinner();
    await this.click(this.triggerSlot);
    await this.click(this.activity);
    await this.click(this.activityItem);

    await this.waitForElementIsVisible(this.activityType);
    await this.click(this.activityType);

    await this.click(this.action);
    await this.type(this.actionType, "Run Recon");
    await this.click(this.runRecon);

    await this.waitForElementIsVisible(this.sourceType);
    await this.click(this.sourceType);
    await this.click(this.workspace);

    await this.waitForElementIsVisible(this.reconId);
    await this.click(this.reconId);
    await this.click(this.testsigmaRecon);

    await this.click(this.saveWorkflow);
    await this.waitForSpinner();

    await this.click(this.publishButton);
    await this.waitForSpinner();

    return this;
  }

  // =========================================================
  // WORKFLOW EXECUTION
  // =========================================================

  async startWorkflowAndVerifyCompletion(): Promise<this> {
    await this.click(this.instances, {
             retryOptions: { retries: 5, baseDelayMs: 2000 }
      });
    await this.click(this.startButton);
    await this.click(this.refresh);
    await this.click(this.refresh, { 
      retryOptions: { retries: 5, baseDelayMs: 2000 } 
    }

    );

    while(!(await this.running.isVisible())){
      if ( await this.running.isVisible()) {
        break;
      }else{
        await this.click(this.refresh);
         await this.pause(500);
      }
    } 

     while (!(await this.completed.isVisible())) {
    
      if (await this.completed.isVisible()) {
        break;
      }else{
        await this.click(this.refresh);
         await this.pause(500);
      } 
      
    }

   
    

    return this;
  }
}
