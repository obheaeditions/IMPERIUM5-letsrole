/******************************************************** 
 *                  Initialisation                      *
*********************************************************/


init = function(sheet){

    log("init "+sheet.id());

    //Main character sheet
    if(sheet.id() == "main") {
        lancersDivers(sheet);//handle dice rolls
        initMain(sheet);
    };

    if(sheet.id() == "cohesion") {
        coheSheet = sheet;
    };

    if(sheet.id() == "roll_composition"){
        diceSheet = sheet;
    }
}; 

//displaying of dice role
initRoll = function(result, callback){
    //log("init roll")
    if (result.containsTag("intensity")){
        callback("intensity_display", function(sheet){
            let total_int = result["_raw"]["right"]["total"];//the value to display is stored in the dice roll
            sheet.get("text_total_int").value(total_int);
        });
    }
    else{
        callback("dice_view", function(sheet){
            //log(result.allTags);
            if (! result.containsTag("paradigme")){

                let roll_result = result["_raw"]["values"];

                let dice_num = roll_from_tags(result.allTags);
                let role = dice_num[0];
                let help = dice_num[1];
                let universe = dice_num[2]; 
                let name = dice_num[3]; //get the roll parameters
    
                let treshold = 2;
                let player_success = 0;
                let gm_success = 0;

                roll_details = [roll_result.slice(0,role), roll_result.slice(role, role+help), roll_result.slice(role+help,role+help+universe), roll_result.slice(role+help+universe)];
                //separate the dice between role - help - universe - entropy

                //display role result
                player_success += display_dice(sheet, roll_details[0], treshold, "role", "info") ; //role -> name of widgets, info -> blue color for success (bootstrap style)
                //display help result
                player_success += display_dice(sheet, roll_details[1], treshold, "help", "info") ; //help-> name of widgets, info -> blue color (bootstrap style)
                //display gm result
                gm_success += display_dice(sheet, roll_details[2], treshold, "real", "warning") ; //real-> name of widgets, warning -> yellow color (bootstrap style)

                //display entropy result
                let entropySucess = display_entropy(sheet, roll_details[3]);
                player_success += entropySucess[0];
                gm_success += entropySucess[1];

                //if a speciality bonus was used
                log("sepciality");
                if ( result.containsTag("substract") ){ player_success += substract_one(sheet, roll_details[0], roll_details[1], treshold); }

                //if a nature bonus was used and player already have a success
                log("nature");
                if (result.containsTag("success") && player_success > 0){
                    player_success += 1;
                }

                //display total success
                log("total");
                sheet.get("text_player_success").text("Succès de " + name + " : " + player_success);
                //display total success
                sheet.get("text_reality_success").text("Succès de la réalité : " + gm_success);

            }
            if (result.containsTag("paradigme")){

                let player_success = 0;
                let gm_success = 0;

                //roll_result = result["_raw"]["values"];
                roll_details = dice_from_tags(result.allTags);
                let role = roll_details[0];
                let help = roll_details[1];
                let real = roll_details[2];
                let entr = roll_details[3];
                let treshold = roll_details[4];
                let name = roll_details[5];
                //log("Dice roll: "+treshold);
                //separate the dice between role - help - universe - entropy

                //display role result
                player_success += display_dice(sheet, role, treshold, "role", "info") ; //role -> name of widgets, info -> blue color for success (bootstrap style)
                //display help result
                player_success += display_dice(sheet, help, treshold, "help", "info") ; //help-> name of widgets, info -> blue color (bootstrap style)
                //display gm result
                gm_success += display_dice(sheet, real, 2, "real", "warning") ; //real-> name of widgets, warning -> yellow color (bootstrap style)

                //display entropy result
                let entropySucess = display_entropy(sheet, entr);
                player_success += entropySucess[0];
                gm_success += entropySucess[1];

                //if a speciality bonus was used
                if ( result.containsTag("substract") ){ player_success += substract_one(sheet, roll_details[0], roll_details[1], treshold); }

                //if a nature bonus was used
                if (result.containsTag("success") && player_success > 0){
                    player_success += 1;
                }

                //display total success
                sheet.get("text_player_success").text("Succès de " + name + " : " + player_success);
                //display total success
                sheet.get("text_reality_success").text("Succès de la réalité : " + gm_success);

            }

        });
    }
};

//Roll intialisation
const lancersDivers = function(sheet) {
    //log("lancers divers")
    //Basic manual roll
    sheet.get("jet_manuel").on( "click", function(){roll_basic(sheet);} );


    //manual conversion of narrative units in intesity
    sheet.get("conv_manuel").on("click", function(){sheet.prompt("Quelles ressources voulez vous utiliser?", "intensite", function(result){
                                                        roll_intensity(sheet,  Tables.get("variables").get('total_int')["value"] );
                                                    }, function(promptView){
                                                        turn_off_all_int(promptView);
                                                        //synchro_int_view(promptView, sheet.get("un").value());
                                                        //initInt(promptView);
                                                        initPrompt(promptView, "intensity_generation_zones", sheet.get("un").value());
                                                    }); 
                                                });

    //The 6 souls rolls:

    //Brutality roll
    sheet.get("soul_name_0").on ("click", function(){
        sheet.prompt('Jet de rôle', 'roll_composition', function(result) { 
            roll_with_launcher(diceSheet);
        }, 
        function(promptView){ // callbackInit
            prepare_launcher(promptView,0);
        })
    });

    //Dynamism roll
    sheet.get("soul_name_1").on ("click", function(){
        sheet.prompt('Jet de rôle', 'roll_composition', function(result) { 
            roll_with_launcher(diceSheet);
        }, 
        function(promptView){ // callbackInit
            prepare_launcher(promptView,1);
        })
    });

    //Autority
    sheet.get("soul_name_2").on ("click", function(){
        sheet.prompt('Jet de rôle', 'roll_composition', function(result) { 
            roll_with_launcher(diceSheet);
        }, 
        function(promptView){ // callbackInit
            prepare_launcher(promptView,2);
        })
    });

    //Simulacre
    sheet.get("soul_name_3").on ("click", function(){
        sheet.prompt('Jet de rôle', 'roll_composition', function(result) { 
            roll_with_launcher(diceSheet);
        }, 
        function(promptView){ // callbackInit
            prepare_launcher(promptView,3);
        })
    });

    //Knowledge
    sheet.get("soul_name_4").on ("click", function(){
        sheet.prompt('Jet de rôle', 'roll_composition', function(result) { 
            roll_with_launcher(diceSheet);
        }, 
        function(promptView){ // callbackInit
            prepare_launcher(promptView,4);
        })
    });

    //Creativity
    sheet.get("soul_name_5").on ("click", function(){
        sheet.prompt('Jet de rôle', 'roll_composition', function(result) { 
            roll_with_launcher(diceSheet);
        }, 
        function(promptView){ // callbackInit
            prepare_launcher(promptView,5);
        })
    });






};

//get the mainSheet id and define other interactivity
const initMain = function(sheet){
    mainSheet = sheet;

    //cohesion removal
    sheet.get("click_cohe_phy").on ("click", function(){
        sheet.prompt('Retirer de la cohésion', 'cohesion', function(result) { 
            remove_cohe ( "phy", Number(coheSheet.get("cohesion_remove").value()) );
        }, 
        function(promptView){// callbackInit
        })
    });
    sheet.get("click_cohe_soc").on ("click", function(){
        sheet.prompt('Retirer de la cohésion', 'cohesion', function(result) { 
            remove_cohe ( "soc", Number(coheSheet.get("cohesion_remove").value()) );
        }, 
        function(promptView){// callbackInit
        })
    });
    sheet.get("click_cohe_men").on ("click", function(){
        sheet.prompt('Retirer de la cohésion', 'cohesion', function(result) { 
            remove_cohe ("men", Number(coheSheet.get("cohesion_remove").value()) );
        }, 
        function(promptView){// callbackInit
        })
    });

    synchronise_all_check_boxes(sheet);

    sheet.get("arrow_source_karma").on( "click", function(){ 
        let sou = sheet.get("pts_sou").value();
        let kar = sheet.get("pts_kar").value();
        if (sou > 0){
            sheet.get("pts_sou").value(sou-1);
            sheet.get("pts_kar").value(kar+1);
        }
    } );
    sheet.get("arrow_karma_xp").on( "click", function(){ 
        let kar = sheet.get("pts_kar").value();
        let xp= sheet.get("pts_xp").value();
        if (kar > 0){
            sheet.get("pts_kar").value(kar-1);
            sheet.get("pts_xp").value(xp+1);
        }
    } );
   

};

//how to initialize a prompt - with some difference for each prompt
const initPrompt = function(promptView, table_name, un){
    //log("init prompt");
    let table = Tables.get(table_name);
    table.each(function(zone_name){
        initZone(promptView, zone_name.id, Number(zone_name.karma_needed), table_name);
    });
    if (table_name.includes("paradigme")){
        replace_text(promptView, "text_para_0", mainSheet.get("para_name_0").value() + " : " + mainSheet.get("para_0").value() );
        replace_text(promptView, "text_para_1", mainSheet.get("para_name_1").value() + " : " + mainSheet.get("para_1").value() );
        replace_text(promptView, "text_para_2", mainSheet.get("para_name_2").value() + " : " + mainSheet.get("para_2").value() );
        replace_text(promptView, "text_para_3", mainSheet.get("para_name_3").value() + " : " + mainSheet.get("para_3").value() );
        //if the last paradigm is not defined, just write "-"
        if (mainSheet.get("para_name_4").value() == ""){
            replace_text(promptView, "text_para_4", "-");
        } else {
            replace_text(promptView, "text_para_4", mainSheet.get("para_name_4").value() + " : " + mainSheet.get("para_4").value() );
        }
    }

    if (table_name.includes("roll")){
        turn_off_all(promptView, array_from_table(table_name));
        promptView.get("icone_aide_top").on( "click", function(){ arrow_btn(promptView, "help_pool", 1 )} );
        promptView.get("icone_aide_bot").on( "click", function(){ arrow_btn(promptView, "help_pool", -1 ) } );
        promptView.get("icone_real_top").on( "click", function(){ arrow_btn(promptView, "real_pool", 1 ) } );
        promptView.get("icone_real_bot").on( "click", function(){ arrow_btn(promptView, "real_pool", -1 ) } );
    }

    if (table_name.includes("intensity")){
        promptView.get("cancelled_un_top").on( "click", function(){ arrow_btn(promptView, "text_cancelled_un", 1 ); update_int(promptView);} );
        promptView.get("cancelled_un_bot").on( "click", function(){ arrow_btn(promptView, "text_cancelled_un", -1 ); update_int(promptView); } );

        replace_text(promptView, "text_base_units", un);

        //get karma_used and un_used to 0
        Tables.get("variables").get('karma_used')["value"] = 0;
        Tables.get("variables").get('un_used')["value"] = 0;
        Tables.get("variables").get('total_int')["value"] = 0;

        //show only as many icons as there is narrative units (un for short)
        log("un"+un);
        for (let i = 0; i < Math.min(un,14); i++){
            log("show "+i);
            show_full_icon(promptView, i);
            log("white "+i);
            white_icon(promptView, i);
        }
        //and hide the others
        for (let i = Math.min(un,14); i < 14; i++){
            log("hide "+i);
            hide_icon(promptView, i);
        }

        //color them correctly
        update_int(promptView);
    }
};

const initZone = function (promptView, zone_name, karma_needed, type){
    //log("init zone "+zone_name);
    let zone = Tables.get(zone_name+"_btn");
    //get all the btn in the zone
    let btn_names = array_from_zone(zone_name+"_btn");

    //give every btn it's default "on click" and text
    zone.each(function(line){
        let name = line.id;
        let text = line.text;

        if (type.includes("roll")){
            promptView.get(name).on("click", function() {update_zone(promptView, name, btn_names, karma_needed)});
        }
        if (type.includes("paradigme")){
            log(promptView.id);
            promptView.get(name).on("click", function() {update_all_para(promptView, line.number)});
        }
        if (type.includes("intensity")){
            promptView.get(name).on("click", function() {update_int_btn(promptView, btn_names, name, karma_needed)});
        }

        
        if (text !== ""){
            replace_text(promptView, name, mainSheet.get(text).value());
        }   
    });

};

//get all the btns in a prompt / a zone from a prompt
const array_from_zone = function(zone_name){
    let zone = Tables.get(zone_name);
    let btn_names = [];
    zone.each(function(line){
        btn_names.push(line.id);
        
    });
    return(btn_names);
};
const array_from_table = function(table_name){
    let table = Tables.get(table_name);
    let btn_names = [];
    table.each(function(zone_name){
        let zone = Tables.get(zone_name.id+"_btn");
        zone.each(function(line){
            btn_names.push(line.id);
        });
    });
    return(btn_names);
};

//generate an array with all the btns referenced in the view associated with the corresponding value
const value_from_table = function(table_name){
    let table = Tables.get(table_name);
    let btn_names = {};
    table.each(function(zone_name){
        let zone = Tables.get(zone_name.id + "_btn");
        zone.each(function(line){
            btn_names[line.id] = Number(line.value);
        });
    });
    return(btn_names);
};
//generate an array with all the btns referenced in the view associated with "false" - at first, none of them are on
const is_on_from_table = function(table_name){
    let table = Tables.get(table_name);
    let btn_names = {};
    table.each(function(zone_name){
        let zone = Tables.get(zone_name.id + "_btn");
        zone.each(function(line){
            btn_names[line.id] = false;
        });
    });
    return(btn_names);
};


/******************************************************** 
 *              Dynamic view modification               *
 *                  -Dice display                       *
 *                  -Smart check boxes                  *
 *                  -Buttons manipulation               *
 *                      -roll composition               *
 *                      -paradigm choice                *
 *                      -intensity generation           *
*********************************************************/

/****************Dice display functions*****************/

//write the dice with the correct color and count the success
const display_dice = function (sheet, array, treshold, type, color){

    let numberDice = array.length;
    let success = 0;
    
    if (array.length == 0){//if no dice rolled in this category
        let id = "dice_"+type+"1";
        sheet.get(id).text("-");//just diplay a "-" 

        for (let i = 9; i > 1; i--){
            sheet.get("dice_"+type+i).text("");//make sure all the others are hidden
            sheet.get("dice_"+type+i).addClass("d-none");
        }


        return(0);//and exit with no success
    }

    //write every dice result in array
    for (let i = 0; i < numberDice; i++){

        let id = "dice_"+type+(i+1);//ex: dice_role_4
        let value = array[i];
        sheet.get(id).text(value);//write result

        sheet.get(id).removeClass("d-none");
        if  (value <= treshold){//if it's a success
            sheet.get(id).addClass("text-"+color);//diplay success in blue/yellow (info/warning)
            success = success + 1;//more success
        }
    }
    //ensure the others are not written
    for (let i = 9; i > numberDice; i--){
        sheet.get("dice_"+type+i).text("");//make sure all the others are hidden
        sheet.get("dice_"+type+i).addClass("d-none");
    }

    return(success);

};

//add a success if possible according to the speciality bonus rule
const substract_one = function (sheet, roleArray, helpArray, treshold){

    //try to change a failure into a success within role dice
    //by removing 1 to the result (displayed as original number, but blue)
    for (let i = 0; i < roleArray.length; i++){
        if (roleArray[i] == treshold +1){
            let id = "dice_role"+(i+1);
            sheet.get(id).addClass("text-info");//colors corresponding display blue
            return(1);//add a success
        }
    }
    //if it was not possible, try with help dice
    for (let i = 0; i < helpArray.length; i++){
        if (helpArray[i] == treshold +1){
            let id = "dice_help"+(i+1);
            sheet.get(id).addClass("text-info");//colors corresponding display blue
            return(1);//add a success
        }
    }

    return(0);//no more success

};

//write the entropy result and add success according to the entropy rule
const display_entropy = function (sheet, entrArray){

    let id = "dice_entr";
    let value = entrArray[0];
    let player_success = 0;
    let gm_success = 0;

    //result + good/bad omen
    if (value === 1){
        sheet.get(id).text("1 - Bon présage!");
    }
    else if (value === 8){
        sheet.get(id).text("8 - Mauvais présage!");
    }
    else{
        sheet.get(id).text(value);
    }

    //color
    if  (value === 2){
        sheet.get(id).addClass("text-info");
    }
    else if (value === 7){
        sheet.get(id).addClass("text-warning");
    }

    //success
    if (value == 2){
        player_success = player_success + 1;
    }
    else if (value == 7){
        gm_success = gm_success + 1;
    }
    return ([player_success, gm_success]);
};

//count all success in a roll (without displaying anything) 
const count_all_success = function (result){
    log("counting");
    let success = 0;
    let raw_result = result["_raw"]["values"];
    let roll_result = [];
    let treshold = 2;
    if (result.containsTag("paradigme")){
        roll_result = dice_from_tags(result.allTags);
        log("roll_result " + roll_result );
        treshold = roll_result[4];
        log("treshold" + treshold);
    }
    else {
        let dice_num = roll_from_tags(result.allTags);

        let role = dice_num[0];
        let help = dice_num[1];
        let universe = dice_num[2]; //get the roll parameters
        roll_result = [raw_result.slice(0,role), raw_result.slice(role, role+help), raw_result.slice(role+help,role+help+universe), raw_result.slice(role+help+universe)];
    }
    
    //role & help
    for (let i = 0; i<roll_result[0].length; i++){
        if (roll_result[0][i]<=treshold){
            success ++;
            log("+1 role success: "+i)
        }
    }
    for (let i = 0; i<roll_result[1].length; i++){
        if (roll_result[1][i]<=treshold){
            success ++;
            log("+1 help success: "+i)
        }
    }
    //entropy
    if (roll_result[3][0] === 2){
        success++;
        log("+1 entropy succes");
    }

    //speciality
    let flag = false;
    if (result.containsTag("substract")){
        for (let i = 0; i < roll_result[0].length; i++){
            if (roll_result[0][i] === treshold +1){
                if(!flag){
                    success += 1;//add a success
                    flag = true;
                    log("+1 role substract");
                }
            }
        }
        //if it was not possible, try with help dice
        for (let i = 0; i < roll_result[1].length; i++){
            if (roll_result[1][i] === treshold +1){
                if(!flag){
                    success += 1;//add a success
                    flag = true;
                    log("+1 help substract");
                }
            }
        }
    }

    //nature
    if (result.containsTag("success") && success>0){
        success++;
        log("+1 nature success");
    }

    log("counted "+ success + "success");
    return(success);

}

/**************** Smart check boxes *******************/

//when a check box is checked, check all the ones before
const check_all_previous = function (sheet, number, boxes){
    //log("check all previous");
    for (let i = 0; i <= number; i++){
        let id = boxes[i];
        sheet.get(id).value(true);
    }

};
//when a check box is unchecked, uncheck all the ones after
const uncheck_all_next = function (sheet, number, boxes){
    //log("uncheck all next");
    for (let i = number; i < boxes.length; i++){
        let id = boxes[i];
        sheet.get(id).value(false);
    }
};
//when a check box is toogled, toogled evrything correctly
const toogle_all_boxes = function (sheet, number, boxes){
    //log("toogle all boxes");
    let id = boxes[number];
    log(id+ " " + number);
    if (sheet.get(id).value()){
        uncheck_all_next(sheet, number, boxes);
    }
    else {
        check_all_previous(sheet, number, boxes);
    }
};

//synchronise all check boxes in an array (names must be numbered from 0 to X)
const synchronise_check_boxes = function(sheet, array){
    let i = 0;
    array.forEach(function(check_box){
        sheet.get(check_box).on("click", function(){ toogle_all_boxes(sheet, Number(check_box.slice(-1)) , array)});
    });
};

//synchronise all check boxes listed in the table 
const synchronise_all_check_boxes = function(sheet){
    log("start synchro")
    let all_check_boxes = Tables.get("smart_check_boxes");
    log(all_check_boxes);
    let group = "";
    let array = [];

    all_check_boxes.each(function(line){
        log(line.id);
        if (line.group !== group){//if we just changed group
            if (array.length !== 0){//(if === [] we did not change group, this is just initialisation of the loop)
                synchronise_check_boxes(sheet, array);//get all the boxes in the last group to work toghether
                array = [];//get ready for a new group
            }
            group = line.group;//while group === line.group we are still in the same group
        }
        array.push(line.id);
        
    });
    synchronise_check_boxes(sheet, array);



};
/****************Buttons manipulation functions******************/

//////////////ROLL COMPOSITION///////////////

//get the btn names from the table - it makes it easier to fork and hack the system, adding and removing btns
let is_btn_on = is_on_from_table("roll_composition_zones");
let all_btn_name = array_from_table("roll_composition_zones");
let soul_names = ["Brutalité", "Dynamisme", "Autorité", "Simulacre", "Savoir", "Créativité"];

///turn on and color blue a btn
const turn_on_btn = function (sheet, name){
    sheet.get(name).addClass("text-info");
    is_btn_on[name] = true;
};

//turn off and color black a btn
const turn_off_btn = function (sheet, name){
    sheet.get(name).removeClass("text-info");
    is_btn_on[name] = false;
};

//reinitialize launcher when needed
const turn_off_all = function (sheet, btn_names){
    
    for (let i = 0; i<btn_names.length; i++){//turn off all on btn in the archetype zone
        if (is_btn_on[btn_names[i]]){
            turn_off_btn(sheet, btn_names[i]);
        }
    }
    Tables.get("variables").get('karma_used')["value"] = 0;//no karma is used yet

};

const arrow_btn = function (sheet, name, value){
    let calculated = Number (sheet.get(name).value()) + value;
    calculated = Math.max(0, calculated);
    calculated = Math.min(9, calculated);
    sheet.get(name).value(calculated);
}

////////PARADIGM CHOICE////////

let is_para_on = is_on_from_table("paradigmes_zones");
let all_para_btn = array_from_table("paradigmes_zones");

//turn on and color blue a paradigm btn, plus register which para is used
const turn_on_para = function (sheet, number){
    let name = all_para_btn[number];
    sheet.get(name).addClass("text-info");
    is_para_on[name] = true;
    Tables.get("variables").get('para_used')["value"]  = true;
    Tables.get("variables").get('current_para')["value"]  = number;
};

//turn off and color black a paradigm  btn, plus register there is no para used
const turn_off_para = function (sheet, name){
    sheet.get(name).removeClass("text-info");
    is_para_on[name] = false;
    Tables.get("variables").get('para_used')["value"]  = false;
};

//reset all paradigms button (called when prompting the view)
const turn_off_all_para = function (sheet){
    //log ("turn off all para")
    for (let i = 0; i < all_para_btn.length; i++){
        let para_btn = all_para_btn[i];
        turn_off_para(sheet, para_btn);

        if (! is_para_available(sheet, i, 4)){
            sheet.get(para_btn).removeClass("btn-light");
            sheet.get(para_btn).addClass("btn-dark");
        }
        else {
            sheet.get(para_btn).removeClass("btn-dark");
            sheet.get(para_btn).addClass("btn-light");
        }

    }
};

////////INTENSITY DISPLAY////////
let is_int_on = is_on_from_table("intensity_generation_zones");
let int_value = value_from_table("intensity_generation_zones");//get the values of the buttons
int_value["first"] = 3;
int_value[" "] = 3;
int_value["cancelled"] = 0;//add the 3 non-buttons values
let all_int_btn = array_from_table("intensity_generation_zones");

//turn off and color blue an intensity btn
const turn_on_int = function (sheet, name){
    //log("turn_on_int "+ name);
    sheet.get(name).addClass("text-info");
    is_int_on[name] = true;
};

//turn off and color black an intensity btn
const turn_off_int = function (sheet, name){
    sheet.get(name).removeClass("text-info");
    is_int_on[name] = false;
};

//reinitialize launcher when needed
const turn_off_all_int = function (sheet){
    //log ("turn_off_all_int");
    for (let i = 0; i<all_int_btn.length; i++){//turn off all on btn in the archetype zone
        if (is_int_on[all_int_btn[i]]){
            turn_off_int(sheet, all_int_btn[i]);
        }
    }
    Tables.get("variables").get('karma_used')["value"] = 0;//no karma is used yet
};

/********************************************************
 *     Displaying of other views functions              *              
 *                  -Roll composition display           *
 *                  -Paradigm choice display            *
 *                  -Intensity generation display       *
 ********************************************************/ 


/****************Roll composition display functions*****************/

//replace text or darken widget if it's undefined
const replace_text = function(sheet, id, replacement){
    if (replacement === ""){
        sheet.get(id).text("-");
        sheet.get(id).removeClass("btn-light");
        sheet.get(id).addClass("btn-dark");
    }
    else {sheet.get(id).text(replacement);}
    
};

//synchronise text with character sheet

//synchronise the state of all buttons in a zone
const update_zone = function(sheet, name, btn_names, karma){
    let karma_used = Number ( Tables.get("variables").get('karma_used')["value"] );
    karma_pool = mainSheet.get("pts_kar").value();
    //toggle this btn:
    if ( is_btn_on[name] ){ //if btn is on, turn it off
        turn_off_btn(sheet,name);
        if (karma ) {
            karma_used = karma_used - 1;//and remove one used karma if needed
        } 
    }
    else { //if btn is off
        log(karma && karma_used < karma_pool);
        if (karma && karma_used < karma_pool) {//if karma is needed and enough karma remaining
            karma_used = karma_used + 1;//use one more karma
            turn_on_btn(sheet,name);//and turn on
        }
        else if (! karma){//if no karma needed
            turn_on_btn(sheet,name);//turn on the btn
        }
    }

    //turn off all the OTHERS btn
    for (let i = 0; i<btn_names.length; i++){//turn off all on btn in the archetype zone
        if (is_btn_on[btn_names[i]] && btn_names[i] !== name){//except if it's the "name" btn
            turn_off_btn(sheet, btn_names[i]);
            if (karma){karma_used --;}//if it's a karma-using btn, use one less karma
        }
    }
    Tables.get("variables").get('karma_used')["value"] = karma_used;

    update_pool(sheet);
};   

//update the whole launcher form and count dice
const update_pool = function(sheet){
    //log("update_pool");
    //all btn names (I really need to stop hard codin that)
    let archetype_btn_name = array_from_zone("archetype_btn");
    let capacity_btn_name = array_from_zone("capacity_roll_btn");
    let nature_btn_name = array_from_zone("nature_btn");
    //all variables used for the roll
    let dice_bonus = 0;
    let substract_bonus = 0;
    let success_bonus = 0;
    let karma_pool = mainSheet.get("pts_kar").value();
    let dice_pool = Number ( Tables.get("variables").get('dice_pool')["value"] );
    let karma_used = Number ( Tables.get("variables").get('karma_used')["value"] );
    
    //update the different bonus:
    //archetype
    for (let i = 0; i<archetype_btn_name.length; i++){//archetype btns add a die to the pool
        if ( is_btn_on[archetype_btn_name[i]] ){
        
            dice_bonus += 1;
            if (archetype_btn_name[i].includes("spe")){//speciality btns add a die to the pool
                substract_bonus += 1;
            }
        }
    }
    //capacity
    for (let i = 0; i<capacity_btn_name.length; i++){
        if (is_btn_on[capacity_btn_name[i]]){
            dice_bonus += 1;
        }
    }
    //nature
    for (let i = 0; i<nature_btn_name.length; i++){
        if (is_btn_on[nature_btn_name[i]]){
            success_bonus += 1;
        }
    }
    //karma
    if (is_btn_on["text_karma_btn"]){
        dice_bonus += 1;
    }
    replace_text(sheet, "text_display_karma", "Karma restant : "+ ( karma_pool - karma_used) );
    replace_text(sheet, "text_display_pool", "Pool total : "+ (dice_pool + dice_bonus) );
    sheet.get("role_pool").value(dice_pool+dice_bonus);

    //register the roll parameters into the "variables" table
    Tables.get("variables").get('role_pool')["value"]  = dice_pool+dice_bonus;
    Tables.get("variables").get('succ_bonus')["value"]  = success_bonus;
    Tables.get("variables").get('subs_bonus')["value"]  = substract_bonus;

    
    //display the result
    
    

};

/****************Paradigme choice display functions*****************/

//check if the paradigm is available (i.e. defined and not exhausted)
const is_para_available = function (sheet, number, max_use){
    //log("is_para_available");
    let count_used = 0;
    for (let i = 0; i < max_use; i++){
        let check_id = "para_"+number+"_check_"+(i);
        count_used += mainSheet.get(check_id).value();
    };
    let available = (count_used < max_use && mainSheet.get("para_name_"+number).value() !== "");
    return(available);
};

//update the paradigmes (called when one is clicked)
const update_all_para = function(sheet, number){

    let name = all_para_btn[number];

    //if we can use this parameter
    if (is_para_available(sheet, number, 4)){
        //toggle this btn
        if ( is_para_on[name] ){ 
            turn_off_para(sheet,name);}
        else { 
            turn_on_para(sheet,number);}
        
        //turn off all the OTHERS btn
        for (let i = 0; i<all_para_btn.length; i++){//turn off all on btn in the archetype zone
            if (is_para_on[all_para_btn[i]] && i !== Number(number)){//except if it's the previously toogled btn
                turn_off_para(sheet, all_para_btn[i]);
            }
        }
    }

};   

//check the box to mark the use of a paradigm
const check_para_box = function (number, max_use){
    //try to check every box in order
    for (let i = 0; i < max_use; i++){
        let check_id = "para_"+number+"_check_"+(i);
         if (! mainSheet.get(check_id).value() ){//if the check box is empty
            mainSheet.get(check_id).value(true);
            return(0);
         }
    };
};

//when you are done with the paradigms, apply it to the roll
const apply_para = function(sheet, roll_result){
    //Step 1: get the paradigm used and the new treshold
    let para = Tables.get("variables").get('current_para')["value"];
    check_para_box(para, 4);
    let para_value =  Number( mainSheet.get("para_"+para).value() );
    let para_letter = num_to_letter( [para_value])[0];

    //Step 2: get the number of dice in each category
    let dice_num = roll_from_tags(roll_result.allTags);
    let role = dice_num[0];
    let help = dice_num[1];
    let universe = dice_num[2]; //get the roll parameters

    //Step 3: generate all tags for this role
    let oldTags = roll_result.allTags;//success, substract may have been used. NameXXXXX is important
    let rollTags = tags_from_roll(roll_result, role, help, universe);//get the tags associated with the result
    let tags = [rollTags[0], rollTags[1], rollTags[2], rollTags[3], "paradigme", "paradigmeValue"+ para_letter];//add paradigme and the paradigme value
    for (let i = 0; i < oldTags.length; i++){
        tags.push(oldTags[i]);
    }

    //Step 4: trow 0 dice to call a new roll and display the updated result - all infos about it are in the tags
    let newDisplay = Dice.create("0d1")
                            .tag(tags);

    let roll = new RollBuilder(sheet);    
    let new_result = [];              
    roll.expression(newDisplay)
        .onRoll(function(result){new_result = result;})
        .title("Jet de rôle - " + role + help + universe +" - Paradigme "+para_value)
        .addAction("Convertir en intensité", function(){
            sheet.prompt("Quelles ressources voulez vous utiliser?", "intensite", function(result){
                roll_intensity(sheet,  Tables.get("variables").get('total_int')["value"] );
            }, function(promptView){
                turn_off_all_int(promptView);
                //synchro_int_view(promptView, count_all_success(new_result));
                //initInt(promptView);
                initPrompt(promptView, "intensity_generation_zones", count_all_success(new_result));
            });
        });

    roll.roll();
    
}

/****************Intensity generation display functions*****************/


const is_karma_needed = function(zone){
    //if one of the btn in the zone is already selected - yes you need karma
    for (let i = 0; i < zone.length; i++){
        if (is_int_on[zone[i]]){
            return(true);
        }
    }
    return(false);
}
//update a btn
const update_int_btn = function(sheet, zone, name, karma_needed, only_one){
    log("Name: " + name);
    let un_used = Tables.get("variables").get('un_used')["value"];
    log("UN:"+un_used);
    let karma_used = Tables.get("variables").get('karma_used')["value"];
    let karma_pool = mainSheet.get("pts_kar").value();
    let max_un = sheet.get("text_base_units").value();
    
    if ( is_int_on[name] ){ //if btn is on, turn it off
        turn_off_int(sheet,name);
        if (karma_needed || is_karma_needed(zone) ){
            karma_used --;
        }
        else{
            un_used --;
        }
    }
    else {//if btn is off
        if (! is_karma_needed(zone) && !karma_needed && un_used < max_un){
            turn_on_int(sheet,name);//turn on the btn
            un_used++
        }
        else if (karma_used < karma_pool){
            log("need karma")
            turn_on_int(sheet,name);
            karma_used ++;
        }
    }
    log("UN:"+un_used+". maxUN:"+max_un);
    Tables.get("variables").get('un_used')["value"] = un_used;
    Tables.get("variables").get('karma_used')["value"] = karma_used;
    update_int(sheet);
};   

//update the whole view
const update_int = function(sheet){

    //STEP 1: Create the empty array (going to store all used ressources)

    //get the max number of un from the title
    let max_un = sheet.get("text_base_units").value();
    let cancelled_un = sheet.get("text_cancelled_un").value();
    let karma_pool = mainSheet.get("pts_kar").value();
    if (cancelled_un > max_un){
        log("you cancelled too much");
        cancelled_un = max_un;
        sheet.get("text_cancelled_un").value(max_un);
    }
    //create the UN values array
    let karma_array = [];
    let un_array = []; 
    if (max_un-cancelled_un >= 1){///1rst unit always create 3 UN
        un_array.push("first")
    }
    let cancelled_array = [];
    let count_un = un_array.length;
    for (let i = 1; i < max_un-cancelled_un; i++){
        un_array.push(" ");//others units are free - for now
    }
    for (let i = 0; i < cancelled_un; i++){
        cancelled_array.push("cancelled");
    }

    //STEP 2: Fill the array with the used ressources 
    //(if the GUI did it's job, all of them are selected according to the rules, but it includes safety check)


    //the 4 zones we are going to check
    let zone_equ = array_from_zone("equipement_btn");
    let zone_cap = array_from_zone("capacity_int_btn");
    let zone_sng = array_from_zone("singularity_btn");
    let zone_con = array_from_zone("contacts_btn");
    let all_zones = [zone_equ, zone_cap, zone_sng, zone_con];
    
    //hide all icons
    for (let i = 0; i < 14; i++){
        hide_icon(sheet, i);
    }
    //check every zone
    for (let i = 0; i < all_zones.length; i++){

        let in_karma_array = false;//turn true if a first button is checked 

        for (let j = 0; j < all_zones[i].length; j++){
            name = all_zones[i][j];
            log(name);
            if (is_int_on[name] && !in_karma_array && count_un < max_un - cancelled_un){//if the btn is on, the first in the zone and there is still UN available
                un_array[count_un] = name;
                count_un++;
                in_karma_array = true; //next on btn will be stored in karma array
            }
            else if(is_int_on[name] && (in_karma_array || count_un >= max_un - cancelled_un) && karma_array.length < karma_pool){//else if the btn is on, but should be in the karma array, and there is room in the karma array
                karma_array.push(name);
            }
        }
    }
    if (is_int_on["text_karma_int"]){
        karma_array.push("text_karma_int");
    }
    //STEP 3: color and number every icon accordingly, and sum the total
    let total = 0;
    let counter = 0;
    log(un_array);
    for (let i = 0; i < un_array.length; i++){
        name = un_array[i];
        counter ++;
        if(name === " "){
            white_icon (sheet, i);
            show_full_icon (sheet, i);
        }
        else {
            blue_icon (sheet, i);
            show_full_icon (sheet, i);
        }
        //and write the correct value underneath
        sheet.get("label_int_"+i).value( int_value[name] );
        total = total + int_value[name];
    }
    for (let i = 0; i < cancelled_array.length; i++){
        name = cancelled_array[i];
        counter++;
        yellow_icon (sheet, counter);
        show_full_icon (sheet, counter);
        
        //and write the correct value underneath
        sheet.get("label_int_"+counter).value( int_value[name] );
        total = total + int_value[name];
    }
    for (let i = 0; i < karma_array.length; i++){
        counter++;
        name = karma_array[i];
        blue_icon (sheet, counter);
        show_empty_icon (sheet, counter);

        sheet.get("label_int_"+counter).value( int_value[name] );
        total = total + int_value[name];
    }
    

    //STEP 4: write UN total and the remaining karma

    Tables.get("variables").get('karma_used')["value"] = karma_array.length;
    Tables.get("variables").get('total_int')["value"] = total;
    sheet.get("text_display_karma").value(  mainSheet.get("pts_kar").value()  - karma_array.length);
    sheet.get("text_display_tot").value(total);

}


//manipulation of narrative units icons
const show_full_icon = function (sheet, number){
    sheet.get("icon_int_"+number).show();
    sheet.get("icon_empty_int_"+number).hide();
    sheet.get("label_int_"+number).show();
};

const show_empty_icon = function (sheet, number){
    sheet.get("icon_int_"+number).hide();
    sheet.get("icon_empty_int_"+number).show();
    sheet.get("label_int_"+number).show();
};

const hide_icon = function (sheet, number){
    sheet.get("icon_int_"+number).hide();
    sheet.get("icon_empty_int_"+number).hide();
    sheet.get("label_int_"+number).hide();
};

const yellow_icon = function (sheet, number){
    sheet.get("icon_int_"+number).removeClass("text-info");
    sheet.get("icon_int_"+number).addClass("text-warning");
    sheet.get("icon_empty_int_"+number).removeClass("text-info");
    sheet.get("icon_empty_int_"+number).addClass("text-warning");
    sheet.get("label_int_"+number).removeClass("text-info");
    sheet.get("label_int_"+number).addClass("text-warning");
};

const blue_icon = function (sheet, number){
    sheet.get("icon_int_"+number).addClass("text-info");
    sheet.get("icon_int_"+number).removeClass("text-warning");
    sheet.get("icon_empty_int_"+number).addClass("text-info");
    sheet.get("icon_empty_int_"+number).removeClass("text-warning");
    sheet.get("label_int_"+number).addClass("text-info");
    sheet.get("label_int_"+number).removeClass("text-warning");
};

const white_icon = function (sheet, number){
    sheet.get("icon_int_"+number).removeClass("text-info");
    sheet.get("icon_int_"+number).removeClass("text-warning");
    sheet.get("icon_empty_int_"+number).removeClass("text-info");
    sheet.get("icon_empty_int_"+number).removeClass("text-warning");
    sheet.get("label_int_"+number).removeClass("text-info");
    sheet.get("label_int_"+number).removeClass("text-warning");
};

/******************************************************** 
 *    Dice rolling and number crunching functions       *
 *                  -Basic roll                         *
 *                  -Launcher roll                      *
 *                  -Tag handling                       *
 *                  -Cohesion removing                  *
*********************************************************/

/****************Basic roll*****************/

//build a basic roll
const build_basic = function(sheet) {
    let role = Number(sheet.get("role_pool").value());
    let help = Number(sheet.get("help_pool").value());
    let universe = Number(sheet.get("real_pool").value()); //get the three parameters
    let name = mainSheet.get("nom").value() ;

    let tags = ["rolenum"+num_to_letter([role]), "helpnum"+num_to_letter([help]), "realnum"+num_to_letter([universe]), "name"+name];

    Tables.get("variables").get('dice_pool')["value"]  = role;
    Tables.get("variables").get('help_pool')["value"]  = help;
    Tables.get("variables").get('real_pool')["value"]  = universe;

    let total = (role+help+universe+1);//add them, add 1 for entropy dice
    let dicetotal = Dice.create( total+"d8").tag(tags) ;//prepare all the d8 and add the tags
    return (dicetotal);
};

//roll basic dice
const roll_basic = function(sheet){
    let dice = build_basic(sheet);
    let roll = new RollBuilder(sheet);
    let roll_result = [];

    let role = Tables.get("variables").get('dice_pool')["value"];
    let help = Tables.get("variables").get('help_pool')["value"];
    let universe = Tables.get("variables").get('real_pool')["value"];

    roll.expression(dice)
        .title("Jet de rôle - " + role + help + universe)
        .onRoll(function(result){
                roll_result = result;
		});

    roll.roll();
    return(roll_result); 
};


/****************Launcher roll*****************/

//build a roll from launcher
const build_with_launcher = function(sheet){
    //log("build with launcher");
    let role = Number(sheet.get("role_pool").value());
    let help = Number(sheet.get("help_pool").value());
    let universe = Number(sheet.get("real_pool").value()); //get the three parameters
    let name = mainSheet.get("nom").value() ;

    let succ_bonus = Tables.get("variables").get('succ_bonus')["value"];
    let subs_bonus = Tables.get("variables").get('subs_bonus')["value"];
    let tags = ["rolenum"+num_to_letter([role]), "helpnum"+num_to_letter([help]), "realnum"+num_to_letter([universe]), "name"+name];
    if (succ_bonus){tags.push("success");}
    if (subs_bonus){tags.push("substract");}
    let total = (role+help+universe+1);//add them, add 1 for entropy dice
    let dicetotal = Dice.create( total+"d8").tag(tags) ;//prepare all the d8 and add a "basic" tag
    return (dicetotal);
};

//roll dice from launcher
const roll_with_launcher = function(sheet){
    //log("roll with launcher");
    let dice = build_with_launcher(sheet);
    let roll = new RollBuilder(sheet);
    let roll_result = [];

    let role = Number(sheet.get('role_pool').value());
    let help = Number(sheet.get('help_pool').value());
    let universe = Number(sheet.get('real_pool').value());

    log( role+" "+help+" "+universe);


    roll.expression(dice)
        .title("Jet de rôle - " + role + help + universe)
        .onRoll(function(result){
                roll_result = result;
			})
        .addAction("Utiliser un paradigme", function(){
            sheet.prompt("Quel paradigme voulez vous utiliser?", "paradigmes", function(result){
                apply_para(sheet, roll_result);
            }, function(promptView){
                turn_off_all_para(promptView);
                //synchro_para_view(promptView);
                initPrompt(promptView, "paradigmes_zones");
            });
        })
        .addAction("Convertir en intensité", function(){
            sheet.prompt("Quelles ressources voulez vous utiliser?", "intensite", function(result){
                roll_intensity(sheet,  Tables.get("variables").get('total_int')["value"] );
            }, function(promptView){
                turn_off_all_int(promptView);
                //synchro_int_view(promptView, count_all_success(roll_result));
                //initInt(promptView);
                initPrompt(promptView, "intensity_generation_zones", count_all_success(roll_result));
            });
        });

    roll.roll();
    
    let karma = mainSheet.get("pts_kar").value() - Tables.get("variables").get('karma_used')["value"];
    mainSheet.get("pts_kar").value(karma);

    let xp= mainSheet.get("pts_xp").value() + Tables.get("variables").get('karma_used')["value"];
    mainSheet.get("pts_xp").value(xp);

    return(roll_result); 
};

//prepare the soul launcher form
const prepare_launcher = function(promptView, soul_num){
            //log("synchro_compo_view");
            //synchro_compo_view(promptView);
            //initCompo(promptView);
            initPrompt(promptView,"roll_composition_zones");

            //get base variable
            let soul_name = soul_names[soul_num];
            let dice_soul = get_dice_soul (mainSheet, soul_num);//soul value - ruptures
            let karma_pool = mainSheet.get("pts_kar").value();
            
            log(soul_name+" : "+ dice_soul);
            replace_text(promptView, "soul_title", soul_name+" : "+ dice_soul ); 
            Tables.get("variables").get('dice_pool')["value"] = dice_soul;
            promptView.get("role_pool").value(dice_soul);

            replace_text(promptView, "text_display_karma", "Karma restant : "+karma_pool);
            replace_text(promptView, "text_display_pool", "Pool total : "+dice_soul);
};

//get the soul value minus the ruptures
const get_dice_soul = function (sheet, soul_num){
    let soul_id = "soul_val_"+soul_num;
    let dice_pool = mainSheet.get(soul_id).value();

    let count_rup = 0;

    if (soul_num == 0 || soul_num == 1){
        count_rup += sheet.get("rup_phy_1").value();
        count_rup += sheet.get("rup_phy_2").value();
        count_rup += sheet.get("rup_phy_0").value();
    }

    if (soul_num == 2 || soul_num == 3){
        count_rup += sheet.get("rup_soc_1").value();
        count_rup += sheet.get("rup_soc_2").value();
        count_rup += sheet.get("rup_soc_0").value();
    }

    if (soul_num == 4 || soul_num == 5){
        count_rup += sheet.get("rup_men_1").value();
        count_rup += sheet.get("rup_men_2").value();
        count_rup += sheet.get("rup_men_0").value();
    }

    return( Math.max(dice_pool-count_rup, 0) );


};


/****************Tag handling *****************/

//sooo, I can't put numbers in tags. So these two functions allow me to replace them by letters, and re-parse the letters to get numbers
//it's a bit of an ugly method to distribute roll information between all users, but it works, so good enough?
//of course, handling the name via the tags too mean that if there is a number in the name there'll be problems ><

//convert an array of number into an array of letters
const num_to_letter = function(numbers){
    let dico = ["Z","A","B","C","D","E","F","G","H","I"]; //0 to 9 - no other number will be passed in the tags
    let letters = [];
    for (let i = 0; i < numbers.length; i++){
        letters.push(dico[numbers[i]]);
    }
    return( letters );
};

//convert an array of letters into an array of numbers
const letter_to_num = function(letters){
    let dico = {"A":1,"B":2,"C":3,"D":4,"E":5,"F":6, "G":7, "H":8, "I": 9, "Z":0};
    let numbers = [];
    for (let i = 0; i < letters.length; i++){
        numbers.push(dico[letters[i]]);
    }
    return(numbers) ;
};

//All important informations about the roll

//take results from a roll, and store it in tags
const tags_from_roll = function(result, role, help, real, name){
    let roll_result = num_to_letter ( result["_raw"]["values"]);
    let roll_details = [roll_result.slice(0,role), roll_result.slice(role, role+help), roll_result.slice(role+help,role+help+real), roll_result.slice(role+help+real)];
    let tag_role = "roledice"+roll_details[0].join("");
    let tag_help = "helpdice"+roll_details[1].join("");
    let tag_real = "realdice"+roll_details[2].join("");
    let tag_entr = "entrdice"+roll_details[3].join("");
    

    return([tag_role, tag_help, tag_real, tag_entr]);

};

//read some tags to get back the results
const roll_from_tags = function(tags){
    let num_role = 0;
    let num_help = 0;
    let num_real = 0;
    let name = "";
    for (let i = 0; i<tags.length; i++){
        let tag = tags[i];
        if ( tag.includes("rolenum") ){
            num_role = letter_to_num ( [tag.slice(-1)])[0];
        }
        if ( tag.includes("helpnum") ){
            num_help = letter_to_num ( [tag.slice(-1)])[0];
        }
        if ( tag.includes("realnum") ){
            num_real = letter_to_num ( [tag.slice(-1)])[0];
        }
        if (tag.includes("name")){
            name = tag.slice(4);
        }

    }
    return([num_role, num_help, num_real, name]);

};

//get back the number of dice in each category from tags
const dice_from_tags = function(tags){

    let num_role = [];
    let num_help = [];
    let num_real = [];
    let num_entr = [];
    let para_value = 2;
    let name = "";

    for (let i = 0; i<tags.length; i++){
        let tag = tags[i];
        if ( tag.includes("roledice") ){
            num_role = letter_to_num ( tag.slice(8).split("") );
        }
        if ( tag.includes("helpdice") ){
            num_help = letter_to_num ( tag.slice(8).split("") );
        }
        if ( tag.includes("realdice") ){
            num_real = letter_to_num ( tag.slice(8).split("") );
        }
        if ( tag.includes("entrdice") ){
            num_entr = letter_to_num ( tag.slice(8).split("") );
        }
        if ( tag.includes("paradigmeValue") ){
            para_value = letter_to_num ( [tag.slice(-1)])[0];
        }
        if (tag.includes("name")){
            name = tag.slice(4);
        }

    }
    return([num_role, num_help, num_real, num_entr, para_value, name]);

};

//get back the value of the paradigm used from tags
const para_value_from_tags = function(tags){

    //log("para value from tags");
    let para_value = 2;
    for (let i = 0; i<tags.lenght; i++){
        tag = tags[i];
        if ( tag.includes("paradigmeValue") ){
            para_value  = Number(tag.slice(-1)[0]);
        }  
    }
    return(para_value);

};

/****************Cohesion removing functions*****************/

//Get the max cohesion in a category
const get_max_cohe = function (name){
    //log("get max cohe")
    max = 0;
    if (name === "phy"){
        max = Number( mainSheet.get("soul_val_0").value() ) + Number( mainSheet.get("soul_val_1").value() ) + 3;
    }
    if (name === "soc"){
        max = Number( mainSheet.get("soul_val_2").value() ) + Number( mainSheet.get("soul_val_3").value() ) + 3;
    }
    if (name === "men"){
        max = Number( mainSheet.get("soul_val_4").value() ) + Number( mainSheet.get("soul_val_5").value() ) + 3;
    }
    return(Number(max));
};

//add a rupture AND return true if there is 2 or less ruptures checked
const add_rupture = function (name){
    //log("add rupture")
    for (let i = 0; i < 3; i++){
        let rup_id = "rup_"+name+"_"+(i);
        if (! mainSheet.get(rup_id).value() ){//if the check box is empty
            mainSheet.get(rup_id).value(true);
            return(i < 2); 
        }
    };
    return(false);
};

//remove X cohesion points, checking the ruptures as needed
const remove_cohe = function (name, damage){
    log("remove_cohe "+name+" "+damage);
    let max = get_max_cohe(name);
    let current_cohe = mainSheet.get("cohesion_"+name).value();
    if (current_cohe === ""){
        current_cohe = max;
    }
    let still_alive = true;
    let added_rupture = false;
    if (current_cohe === 0){
        current_cohe = max;
        still_alive = add_rupture(name);
    }
    
    
    for (let i = 0; i<damage; i++){
        if (!added_rupture){
            current_cohe --;
        }
        if (current_cohe === 0){
            still_alive = add_rupture(name);
            added_rupture = true;
            if (still_alive){
                current_cohe = max;
            }
            else {
                mainSheet.get("cohesion_"+name).value(0); 
                return(0);
            }
        }

    }
    mainSheet.get("cohesion_"+name).value(current_cohe); 
};

/***************Intensity roll**************/

//a pseudo roll with 0 dice, and a function putting the total intensity in the tags
const roll_intensity = function(sheet, int){
    //log("roll intensity")
    log("int"+int);
    let dice = Dice.create( "0d1>" + int).tag("intensity") ;
    let roll = new RollBuilder(sheet);
    roll.expression(dice);
    roll.title("Conversion en intensité");
    roll.roll();

    //move karma around
    let karma = mainSheet.get("pts_kar").value() - Tables.get("variables").get('karma_used')["value"];
    mainSheet.get("pts_kar").value(karma);

    let xp= mainSheet.get("pts_xp").value() + Tables.get("variables").get('karma_used')["value"];
    mainSheet.get("pts_xp").value(xp);

};
