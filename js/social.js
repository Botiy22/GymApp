/* Authenticated RPCs expose only profiles shared through accepted friendships. */
window.Social = (() => {
  const state={data:null,error:'',busy:false,userId:null,contacts:null,contactError:''};
  let pending=null;
  function message(error) {
    if(error.backendCode==='PGRST202'||error.backendCode==='42P01')return 'socialSetup';
    if(error.backendCode==='23505')return 'usernameTaken';
    if(/profile_required/.test(error.message))return 'socialNeedProfile';
    if(/contact_lookup_limit/.test(error.message))return 'contactLookupLimit';
    if(/invalid_phone/.test(error.message))return 'phoneFormat';
    if(/contact_unverified/.test(error.message))return 'contactUnverified';
    if(/friend_not_found/.test(error.message))return 'friendNotFound';
    if(/self_request/.test(error.message))return 'friendSelf';
    if(/request_limit|friend_limit/.test(error.message))return 'friendLimit';
    if(error.code==='auth')return 'socialSignIn';
    if(error.code==='network')return 'socialOffline';
    return 'socialError';
  }
  function reset() {state.data=null;state.error='';state.userId=null;state.contacts=null;state.contactError='';}
  async function refresh() {
    const cloud=window.Cloud;
    if(!cloud||!cloud.on||!cloud.user){reset();state.error='socialSignIn';return;}
    if(state.userId!==cloud.user.id){reset();state.userId=cloud.user.id;}
    if(pending)return pending;
    const owner=state.userId;state.busy=true;state.error='';
    pending=(async()=>{
      try {
        await cloud.sync();
        if(!cloud.user||cloud.user.id!==owner)return;
        let data=await cloud.rpc('social_dashboard',{});
        if(!cloud.user||cloud.user.id!==owner)return;
        state.data=data; // Keep the username setup action available if publication fails.
        // Accounts created before the social migration may have only a private saved username.
        // Publish that explicitly chosen profile when missing, without replacing an existing claim.
        const saved=Profile.clean(window.Store?.d?.settings?.publicProfile);
        if(!data.profile&&saved.username&&cloud.user&&cloud.user.id===owner){
          await publish(saved);
          if(!cloud.user||cloud.user.id!==owner)return;
          data=await cloud.rpc('social_dashboard',{});
        }
        if(cloud.user&&cloud.user.id===owner){state.data=data;try{const contacts=await cloud.rpc('social_contact_settings',{});if(cloud.user&&cloud.user.id===owner){state.contacts=contacts;state.contactError='';}}catch(error){if(cloud.user&&cloud.user.id===owner){state.contacts=null;state.contactError=message(error);}}}}
      catch(error){if(cloud.user&&cloud.user.id===owner)state.error=message(error);}
      finally{state.busy=false;pending=null;}
    })();return pending;
  }
  async function mutate(name,body) {
    if(!Cloud.on||!Cloud.user)throw Object.assign(new Error('sign in'),{code:'auth'});
    const result=await Cloud.rpc(name,body);
    if(result&&result.error)throw new Error(result.error);
    return result;
  }
  let publishing=Promise.resolve();
  function publish(profile) {
    const p=Profile.clean(profile),owner=Cloud.user&&Cloud.user.id;
    const job=publishing.catch(()=>{}).then(async()=>{
      if(!owner||!Cloud.user||Cloud.user.id!==owner)throw Object.assign(new Error('sign in'),{code:'auth'});
      await Cloud.sync();
      if(!Cloud.user||Cloud.user.id!==owner)throw Object.assign(new Error('sign in'),{code:'auth'});
      return mutate('social_save_profile',{p_username:p.username,p_display_name:p.displayName,p_bio:p.bio,p_avatar:p.avatar,p_theme:p.theme,p_badges:p.showcase});
    });
    publishing=job;return job;
  }
  return {state,refresh,reset,message,publish,mutate};
})();
