import{test ,  expect } from "@playwright/test";
import { EasyMyTripPageForFlight } from "../pages/easyMyTripForFlight";   
import { FileUtils } from "@utils/fileUtils";






test("EasyMyTrip fight Booking Test", async ({ page }) => {
    const easyMyTripPage = new EasyMyTripPageForFlight(page);    

    await easyMyTripPage.easyMyTripFlightBookingPage();  
    await easyMyTripPage.selectFlightDates();
    await easyMyTripPage.selectPassengers();
     



});
