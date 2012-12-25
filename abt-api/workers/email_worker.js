var _ = require('underscore');
var logger = require(LIB_DIR + 'log_factory').create("email_worker");
var emailsImpl = require(IMPLS_DIR + 'emails_impl');
var nodemailer = require("nodemailer");
var CONFIG = require('config');

/**
 * A worker thread that will pick emails periodically and try to send them
 */


var EmailWorker = function(){
	/*
	 * 1. Pick 5 queued emails in a batch
	 * 2. Mark them processing. Needs to be atomic.
	 * 3. Try to send them through nodemailer.
	 * 4. When finished, pull another 5.
	 * 
	 * If at any point, no more emails are found queued, Set an interval of 10 secs and try again.
	 * 
	 * After 10 retries to send an email, mark it failed.
	 */
	var ref = this;
	
	CONFIG.email = CONFIG.email || {};
	var interval = CONFIG.email.interval || 10 * 1000; //10 Secs
	var batchSize = CONFIG.email.batchSize || 5;
	
	var transport = nodemailer.createTransport("Sendmail");
	
	this.run = function(){
		if(CONFIG.email.enabled && (CONFIG.email.enabled == true || CONFIG.email.enabled == 'true')){
			emailsImpl.updateBatchToProcessing(batchSize, function(err, data){
				if(err != null){
					logger.error(err);
					setTimeout(ref.run, interval);
				}else{
					if(data && data.status && data.status.code == 1000){
						if(data.totalCount > 0){
							logger.debug("Emails fetched for sending");
							var emails = data.data;
							_.each(emails, function(email){
								var mailOptions = {
									generateTextFromHTML: true,
								    from: email.from,
								    to: email.to,
								    cc: email.cc,
								    bcc: email.bcc,
								    subject: email.subject,
								    html: email.body
								};
	
								transport.sendMail(mailOptions, function(err, data){
									if(err != null){
										// Failed to send email.
										logger.error(err);
										
										//Requeue the mail.
										emailsImpl.markQueued(email.id, function(error, mail){
											if(error != null){
												logger.error(error);
												
												emailsImpl.markFailed(email.id, function(e, m){
													logger.error(e);
												});
											};
										});
									}else{
										logger.info("Sent an email to " + email.to + " with subject : " + email.subject);
										emailsImpl.markSent(email.id, function(error, mail){
											if(error != null){
												logger.error(error);
											}
										});
									};
								});
							});
							
							setTimeout(ref.run, interval);
						}else{
							setTimeout(ref.run, interval);
							logger.info("No queued emails found. Will try again after " + interval + " millisecs. Now : " + new Date());
						}
					}else{
						setTimeout(ref.run, interval);
						logger.error("Unusual error in fetching emails for sending");
					}
				}
			});
		}
	};
};

module.exports = EmailWorker;